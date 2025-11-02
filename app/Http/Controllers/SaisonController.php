<?php

namespace App\Http\Controllers;

use App\Models\Saison;
use App\Models\Ligue;
use App\Models\Equipe;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaisonController extends Controller
{
    private function computeStandingsEquipeIds(Saison $saison): array
    {
        $saison->loadMissing(['equipes:id,nom','journees.matchs']);
        $stats = [];
        foreach ($saison->equipes as $e) {
            $stats[$e->id] = ['pts'=>0,'diff'=>0,'bp'=>0,'nom'=>$e->nom];
        }
        foreach ($saison->journees as $j) {
            foreach ($j->matchs as $m) {
                if (!$m->termine) continue;
                $h=$m->equipe_home_id; $a=$m->equipe_away_id; $sh=(int)$m->score_home; $sa=(int)$m->score_away;
                if (!isset($stats[$h]) || !isset($stats[$a])) continue;
                $stats[$h]['bp']+=$sh; $stats[$a]['bp']+=$sa;
                $stats[$h]['diff']+=($sh-$sa); $stats[$a]['diff']+=($sa-$sh);
                if ($sh>$sa){$stats[$h]['pts']+=3;} elseif($sh<$sa){$stats[$a]['pts']+=3;} else {$stats[$h]['pts']+=1; $stats[$a]['pts']+=1;}
            }
        }
        uasort($stats,function($x,$y){
            if ($x['pts']!==$y['pts']) return $y['pts']<=>$x['pts'];
            if ($x['diff']!==$y['diff']) return $y['diff']<=>$x['diff'];
            if ($x['bp']!==$y['bp']) return $y['bp']<=>$x['bp'];
            return strcmp($x['nom'],$y['nom']);
        });
        return array_keys($stats);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $saisons = Saison::with([
            'ligue:id,nom',
            'equipes:id,nom'
        ])->get();
        return Inertia::render('saisons/index', compact('saisons'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $ligues = Ligue::orderBy('niveau')->get();
        $equipes = \App\Models\Equipe::select('id', 'nom')->orderBy('nom')->get();
        $defaultLigueId = $ligues->first()->id ?? null;
        $suggestedEquipeIds = [];
        if ($defaultLigueId) {
            $ligue = Ligue::find($defaultLigueId);
            $nombre = (int)($ligue->nombre_equipes ?? 0);
            // Dernière saison terminée de cette ligue
            $prev = Saison::where('ligue_id', $ligue->id)->where('status','terminé')->orderByDesc('date_debut')->first();
            $orderedPrev = $prev ? $this->computeStandingsEquipeIds($prev) : [];
            // Promus
            $promoted = [];
            $lower = Ligue::where('niveau', $ligue->niveau + 1)->first();
            if ($lower) {
                $prevLower = Saison::where('ligue_id', $lower->id)->where('status','terminé')->orderByDesc('date_debut')->first();
                if ($prevLower) {
                    $lowerOrder = $this->computeStandingsEquipeIds($prevLower);
                    $promoted = array_slice($lowerOrder, 0, 3);
                }
            }
            $relegated = array_slice($orderedPrev, -3);
            $base = array_values(array_diff($orderedPrev, $relegated));
            $merged = array_values(array_unique(array_merge($promoted, $base)));
            if ($nombre > 0) {
                if (count($merged) < $nombre && !empty($orderedPrev)) {
                    foreach ($orderedPrev as $eid) {
                        if (!in_array($eid, $merged, true)) { $merged[] = $eid; }
                        if (count($merged) >= $nombre) break;
                    }
                }
                $merged = array_slice($merged, 0, $nombre);
            }
            $suggestedEquipeIds = $merged;
        }
        return Inertia::render('saisons/create', compact('ligues','equipes','suggestedEquipeIds'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'status' => 'required|in:en cours,terminé',
            'ligue_id' => 'required|exists:ligues,id',
            'nombre_equipes' => 'required|integer|min:0',
            'equipes' => 'array',
            'equipes.*' => 'exists:equipes,id'
        ]);
        // Empêcher plusieurs saisons "en cours" pour une même ligue
        if ($validated['status'] === 'en cours') {
            $exists = Saison::where('ligue_id', $validated['ligue_id'])
                ->where('status', 'en cours')
                ->exists();
            if ($exists) {
                return back()->withErrors(['status' => 'Une saison "en cours" existe déjà pour cette ligue.'])
                    ->withInput();
            }
        }
        if (($validated['equipes'] ?? null) !== null && count($validated['equipes']) !== (int)$validated['nombre_equipes']) {
            return back()->withErrors(['equipes' => 'Le nombre d\'équipes sélectionnées doit être égal à "Nombre d\'équipes".'])->withInput();
        }
        // Auto-sélection des équipes si aucune liste fournie: basé sur la saison terminée la plus récente
        $equipesToAssign = $request->input('equipes', []);
        if (empty($equipesToAssign)) {
            $ligue = Ligue::find($validated['ligue_id']);
            $nombreEquipes = (int)$validated['nombre_equipes'];

            // Dernière saison TERMINÉE de la même ligue
            $prev = Saison::where('ligue_id', $ligue->id)->where('status','terminé')->orderByDesc('date_debut')->first();
            $orderedPrev = [];
            if ($prev) {
                $orderedPrev = $this->computeStandingsEquipeIds($prev); // ordre du meilleur au moins bon
            }
            // Promotions depuis la ligue de niveau inférieur (niveau + 1)
            $promoted = [];
            $lower = Ligue::where('niveau', $ligue->niveau + 1)->first();
            if ($lower) {
                $prevLower = Saison::where('ligue_id', $lower->id)->where('status','terminé')->orderByDesc('date_debut')->first();
                if ($prevLower) {
                    $lowerOrder = $this->computeStandingsEquipeIds($prevLower);
                    $promoted = array_slice($lowerOrder, 0, 3);
                }
            }
            // Relégations: retirer les 3 dernières de l'ancienne ligue
            $relegated = array_slice($orderedPrev, -3);
            $base = array_values(array_diff($orderedPrev, $relegated));
            // Nouvelle liste: promus puis reste de la ligue en conservant l'ordre
            $merged = array_values(array_unique(array_merge($promoted, $base)));
            if ($nombreEquipes > 0) {
                // Tronquer ou compléter si besoin
                if (count($merged) < $nombreEquipes && !empty($orderedPrev)) {
                    foreach ($orderedPrev as $eid) {
                        if (!in_array($eid, $merged, true)) { $merged[] = $eid; }
                        if (count($merged) >= $nombreEquipes) break;
                    }
                }
                $merged = array_slice($merged, 0, $nombreEquipes);
            }
            $equipesToAssign = $merged;
        }

        $saison = Saison::create($request->only('nom','date_debut','date_fin','status','ligue_id','nombre_equipes'));
        $saison->equipes()->sync($equipesToAssign);

        return redirect()->route('saisons.index')
            ->with('success', 'Saison créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Saison $saison)
    {
        // Optimisation : ne pas charger les logos pour éviter l'épuisement mémoire
        $saison->load([
            'ligue:id,nom',
            'journees:id,saison_id,numero,date',
            'journees.matchs' => function ($query) {
                $query->select('id', 'journee_id', 'equipe_home_id', 'equipe_away_id', 'score_home', 'score_away', 'termine');
            },
            'journees.matchs.homeEquipe:id,nom',
            'journees.matchs.awayEquipe:id,nom',
        ]);
        return Inertia::render('saisons/show', compact('saison'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Saison $saison)
    {
        $ligues = Ligue::all();
        $equipes = \App\Models\Equipe::select('id', 'nom')->orderBy('nom')->get();
        $saison->load('equipes:id,nom');
        return Inertia::render('saisons/edit', compact('saison', 'ligues','equipes'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Saison $saison)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'status' => 'required|in:en cours,terminé',
            'ligue_id' => 'required|exists:ligues,id',
            'nombre_equipes' => 'required|integer|min:0',
            'equipes' => 'array',
            'equipes.*' => 'exists:equipes,id'
        ]);
        // Empêcher plusieurs saisons "en cours" pour une même ligue (ignorer la saison courante)
        if ($validated['status'] === 'en cours') {
            $exists = Saison::where('ligue_id', $validated['ligue_id'])
                ->where('status', 'en cours')
                ->where('id', '!=', $saison->id)
                ->exists();
            if ($exists) {
                return back()->withErrors(['status' => 'Une saison "en cours" existe déjà pour cette ligue.'])
                    ->withInput();
            }
        }
        if (($validated['equipes'] ?? null) !== null && count($validated['equipes']) !== (int)$validated['nombre_equipes']) {
            return back()->withErrors(['equipes' => 'Le nombre d\'équipes sélectionnées doit être égal à "Nombre d\'équipes".'])->withInput();
        }
        $saison->update($request->only('nom','date_debut','date_fin','status','ligue_id','nombre_equipes'));
        $saison->equipes()->sync($request->input('equipes', []));

        return redirect()->route('saisons.index')
            ->with('success', 'Saison mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Saison $saison)
    {
        $saison->delete();

        return redirect()->route('saisons.index')
            ->with('success', 'Saison supprimée avec succès.');
    }
}
