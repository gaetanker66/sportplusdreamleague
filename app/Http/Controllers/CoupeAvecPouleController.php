<?php

namespace App\Http\Controllers;

use App\Models\CoupeAvecPoule;
use App\Models\CoupeAvecPouleModele;
use App\Models\Equipe;
use App\Models\Poule;
use App\Models\PouleMatch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CoupeAvecPouleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $coupesAvecPoules = CoupeAvecPoule::with('modele')->get();
        
        return Inertia::render('coupes-avec-poules/index', [
            'coupesAvecPoules' => $coupesAvecPoules
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $modeles = CoupeAvecPouleModele::where('actif', true)->orderBy('nom')->get();
        $equipes = Equipe::orderBy('nom')->get();
        
        return Inertia::render('coupes-avec-poules/create', [
            'modeles' => $modeles,
            'equipes' => $equipes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'nombre_equipes' => 'required|integer|min:4',
            'nombre_poules' => 'required|integer|min:2',
            'qualifies_par_poule' => 'required|integer|min:1',
            'coupe_avec_poule_modele_id' => 'nullable|exists:coupe_avec_poule_modeles,id',
            'equipes' => 'required|array|min:4',
            'equipes.*' => 'exists:equipes,id',
            'matchs_aleatoires' => 'boolean',
        ]);

        $coupeAvecPoule = CoupeAvecPoule::create([
            'nom' => $request->nom,
            'nombre_equipes' => $request->nombre_equipes,
            'nombre_poules' => $request->nombre_poules,
            'qualifies_par_poule' => $request->qualifies_par_poule,
            'coupe_avec_poule_modele_id' => $request->coupe_avec_poule_modele_id,
            'phase_finale_generee' => false,
            'matchs_aleatoires' => $request->boolean('matchs_aleatoires', true)
        ]);

        // Générer les poules
        $this->genererPoules($coupeAvecPoule, $request->equipes);

        return redirect()->route('dashboard.coupes-avec-poules.index')
                        ->with('success', 'Coupe avec poules créée avec succès');
    }

    /**
     * Display the specified resource.
     */
    public function show(CoupeAvecPoule $coupes_avec_poule)
    {
        $coupes_avec_poule->load([
            'modele',
            'coupePhaseFinale',
            'poules.equipes',
            'poules.matchs.homeEquipe',
            'poules.matchs.awayEquipe'
        ]);

        return Inertia::render('coupes-avec-poules/show', [
            'coupeAvecPoule' => $coupes_avec_poule
        ]);
    }

    public function finaliserEtGenererPhaseFinale(CoupeAvecPoule $coupes_avec_poule)
    {
        // Empêcher double génération
        if ($coupes_avec_poule->phase_finale_generee) {
            return back()->with('success', 'Phase finale déjà générée.');
        }

        $coupes_avec_poule->load('poules.matchs','poules.equipes');
        $q = (int) $coupes_avec_poule->qualifies_par_poule;
        if ($q < 1) return back()->withErrors(['qualifies' => 'Configuration invalide.']);

        // Calculer classements
        $classements = [];
        foreach ($coupes_avec_poule->poules as $poule) {
            $stats = [];
            foreach ($poule->equipes as $e) {
                $stats[$e->id] = ['equipe'=>$e,'pts'=>0,'diff'=>0,'bp'=>0,'bc'=>0];
            }
            foreach ($poule->matchs as $m) {
                if (!$m->termine) continue;
                $sh = (int)($m->score_home ?? 0); $sa = (int)($m->score_away ?? 0);
                if (!isset($stats[$m->equipe_home_id]) || !isset($stats[$m->equipe_away_id])) continue;
                $stats[$m->equipe_home_id]['bp'] += $sh; $stats[$m->equipe_home_id]['bc'] += $sa;
                $stats[$m->equipe_away_id]['bp'] += $sa; $stats[$m->equipe_away_id]['bc'] += $sh;
                $stats[$m->equipe_home_id]['diff'] = $stats[$m->equipe_home_id]['bp'] - $stats[$m->equipe_home_id]['bc'];
                $stats[$m->equipe_away_id]['diff'] = $stats[$m->equipe_away_id]['bp'] - $stats[$m->equipe_away_id]['bc'];
                if ($sh > $sa) { $stats[$m->equipe_home_id]['pts'] += 3; }
                elseif ($sh < $sa) { $stats[$m->equipe_away_id]['pts'] += 3; }
                else { $stats[$m->equipe_home_id]['pts'] += 1; $stats[$m->equipe_away_id]['pts'] += 1; }
            }
            $sorted = collect($stats)->sortByDesc('pts')->sortByDesc('diff')->sortByDesc('bp')->values()->all();
            $classements[$poule->id] = $sorted; // array of rows with 'equipe'
        }

        // Construire la liste des qualifiés par rang (1ers, 2èmes, ...)
        $byRank = [];
        foreach ($classements as $rows) {
            for ($i = 0; $i < min($q, count($rows)); $i++) {
                $byRank[$i+1] = $byRank[$i+1] ?? [];
                $byRank[$i+1][] = $rows[$i]['equipe'];
            }
        }

        // Générer les paires selon la règle donnée et randomiser l'ordre dans l'arbre
        $pairs = [];
        $pouleCount = count($coupes_avec_poule->poules);
        for ($i = 0; $i < $pouleCount; $i+=2) {
            $a = $coupes_avec_poule->poules[$i] ?? null;
            $b = $coupes_avec_poule->poules[$i+1] ?? null;
            if (!$a || !$b) continue;
            for ($rank = 1; $rank <= $q; $rank++) {
                $fromA = $classements[$a->id][$rank-1]['equipe'] ?? null;
                $fromB = $classements[$b->id][$rank-1]['equipe'] ?? null;
                if ($q === 1) {
                    if ($fromA && $fromB) $pairs[] = [$fromA->id, $fromB->id];
                } elseif ($q === 2) {
                    // 1A vs 2B, 1B vs 2A
                    if ($rank === 1 && $fromA && ($classements[$b->id][1]['equipe'] ?? null)) $pairs[] = [$fromA->id, $classements[$b->id][1]['equipe']->id];
                    if ($rank === 1 && $fromB && ($classements[$a->id][1]['equipe'] ?? null)) $pairs[] = [$fromB->id, $classements[$a->id][1]['equipe']->id];
                } else {
                    // 1A vs 3B, 2A vs 2B, 3A vs 1B (exemple fourni)
                    if ($rank === 1 && $fromA && ($classements[$b->id][2]['equipe'] ?? null)) $pairs[] = [$fromA->id, $classements[$b->id][2]['equipe']->id];
                    if ($rank === 2 && $fromA && ($classements[$b->id][1]['equipe'] ?? null)) $pairs[] = [$fromA->id, $classements[$b->id][1]['equipe']->id];
                    if ($rank === 3 && $fromA && ($classements[$b->id][0]['equipe'] ?? null)) $pairs[] = [$fromA->id, $classements[$b->id][0]['equipe']->id];
                    if ($rank === 1 && $fromB && ($classements[$a->id][2]['equipe'] ?? null)) $pairs[] = [$fromB->id, $classements[$a->id][2]['equipe']->id];
                    if ($rank === 2 && $fromB && ($classements[$a->id][1]['equipe'] ?? null)) $pairs[] = [$fromB->id, $classements[$a->id][1]['equipe']->id];
                    if ($rank === 3 && $fromB && ($classements[$a->id][0]['equipe'] ?? null)) $pairs[] = [$fromB->id, $classements[$a->id][0]['equipe']->id];
                }
            }
        }

        // Créer une Coupe classique et générer le bracket de phase finale
        // Note: coupe_modele_id est NULL car les CoupeAvecPouleModele et CoupeModele sont différents
        $coupe = \App\Models\Coupe::create([
            'nom' => $coupes_avec_poule->nom . ' - Phase finale',
            'nombre_equipes' => count($pairs) * 2,
            'coupe_modele_id' => null,
        ]);
        // Attacher toutes les équipes qualifiées
        $equipesIds = [];
        foreach ($pairs as [$h,$a]) { $equipesIds[] = $h; $equipesIds[] = $a; }
        $equipesIds = array_values(array_unique($equipesIds));
        $coupe->equipes()->sync($equipesIds);

        // Randomiser l'ordre des paires dans l'arbre
        shuffle($pairs);
        
        // Construire manuellement un premier round avec aller/retour sauf finale
        $round = $coupe->rounds()->create(['numero' => 1, 'label' => '1er tour']);
        foreach ($pairs as [$home,$away]) {
            $aller = $round->matchs()->create(['equipe_home_id' => $home, 'equipe_away_id' => $away, 'is_aller' => true]);
            $retour = $round->matchs()->create(['equipe_home_id' => $away, 'equipe_away_id' => $home, 'is_aller' => false, 'match_retour_id' => $aller->id]);
            $aller->update(['match_retour_id' => $retour->id]);
        }

        // Générer les rounds suivants (demi-finales, finale)
        $totalTeams = count($pairs) * 2;
        $roundCount = 0; $tmp = $totalTeams; while ($tmp > 1) { $tmp /= 2; $roundCount++; }
        
        for ($r = 2; $r <= $roundCount; $r++) {
            $teamsThisRound = $totalTeams / (2 ** ($r - 1));
            $label = match($teamsThisRound) {
                2 => 'Finale',
                4 => 'Demi-finales',
                8 => 'Quarts',
                16 => '1/8',
                32 => '1/16',
                default => "Round $r",
            };
            $round = $coupe->rounds()->create(['numero' => $r, 'label' => $label]);
            $matchesCount = $teamsThisRound / 2;
            
            if ($r === $roundCount) {
                // Finale : un seul match
                for ($i = 0; $i < $matchesCount; $i++) {
                    $round->matchs()->create([
                        'is_aller' => true, // Pas de retour pour la finale
                    ]);
                }
            } else {
                // Autres rounds : aller-retour
                for ($i = 0; $i < $matchesCount; $i++) {
                    // Créer le match aller
                    $matchAller = $round->matchs()->create([
                        'is_aller' => true,
                    ]);
                    
                    // Créer le match retour
                    $matchRetour = $round->matchs()->create([
                        'is_aller' => false,
                        'match_retour_id' => $matchAller->id,
                    ]);
                    
                    // Lier le match aller au retour
                    $matchAller->update(['match_retour_id' => $matchRetour->id]);
                }
            }
        }

        $coupes_avec_poule->update([
            'phase_finale_generee' => true,
            'coupe_phase_finale_id' => $coupe->id
        ]);
        return redirect()->route('dashboard.coupes.edit', $coupe)->with('success', 'Phase finale générée.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CoupeAvecPoule $coupes_avec_poule)
    {
        // Optimisation : ne pas charger les logos pour éviter l'épuisement mémoire
        $modeles = CoupeAvecPouleModele::where('actif', true)->select('id', 'nom', 'description')->orderBy('nom')->get();
        $equipes = \App\Models\Equipe::select('id', 'nom')->orderBy('nom')->get();
        
        // Récupérer les équipes sélectionnées via la table pivot des poules
        $pouleIds = $coupes_avec_poule->poules()->pluck('id');
        $selectedEquipeIds = \App\Models\PouleEquipe::whereIn('poule_id', $pouleIds)
            ->pluck('equipe_id')
            ->unique()
            ->values();

        \Log::info('CAP edit payload', [
            'id' => $coupes_avec_poule->id,
            'nom' => $coupes_avec_poule->nom,
            'nombre_equipes' => $coupes_avec_poule->nombre_equipes,
            'nombre_poules' => $coupes_avec_poule->nombre_poules,
            'qualifies_par_poule' => $coupes_avec_poule->qualifies_par_poule,
            'modele_id' => $coupes_avec_poule->coupe_avec_poule_modele_id,
            'selectedEquipeIds_count' => $selectedEquipeIds->count(),
        ]);
        
        return Inertia::render('coupes-avec-poules/edit', [
            'coupeAvecPoule' => [
                'id' => $coupes_avec_poule->id,
                'nom' => $coupes_avec_poule->nom,
                'nombre_equipes' => (int) $coupes_avec_poule->nombre_equipes,
                'nombre_poules' => (int) $coupes_avec_poule->nombre_poules,
                'qualifies_par_poule' => (int) $coupes_avec_poule->qualifies_par_poule,
                'coupe_avec_poule_modele_id' => $coupes_avec_poule->coupe_avec_poule_modele_id,
            ],
            'modeles' => $modeles,
            'equipes' => $equipes,
            'selectedEquipeIds' => $selectedEquipeIds->map(fn($id) => (int) $id)->all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CoupeAvecPoule $coupes_avec_poule)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'nombre_equipes' => 'sometimes|integer|min:4',
            'nombre_poules' => 'sometimes|integer|min:2',
            'qualifies_par_poule' => 'sometimes|integer|min:1',
            'coupe_avec_poule_modele_id' => 'nullable|exists:coupe_avec_poule_modeles,id',
            'equipes' => 'array',
            'equipes.*' => 'exists:equipes,id',
        ]);

        $coupes_avec_poule->update($request->only('nom', 'nombre_equipes', 'nombre_poules', 'qualifies_par_poule', 'coupe_avec_poule_modele_id'));

        // Mettre à jour les équipes si fournies
        if ($request->has('equipes')) {
            // Supprimer les anciennes relations
            foreach ($coupes_avec_poule->poules as $poule) {
                $poule->equipes()->detach();
            }
            
            // Ajouter les nouvelles équipes aux poules
            $equipes = $request->input('equipes', []);
            if (!empty($equipes)) {
                $this->genererPoules($coupes_avec_poule, $equipes);
            }
        }

        return back()->with('success', 'Coupe avec poules mise à jour avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CoupeAvecPoule $coupes_avec_poule)
    {
        // Charger les relations nécessaires
        $coupes_avec_poule->load([
            'coupePhaseFinale.rounds.matchs',
            'poules.matchs',
        ]);
        
        // Supprimer la phase finale si elle existe
        if ($coupes_avec_poule->coupePhaseFinale) {
            $phaseFinale = $coupes_avec_poule->coupePhaseFinale;
            // Supprimer tous les matchs de la phase finale et leurs données associées
            foreach ($phaseFinale->rounds as $round) {
                foreach ($round->matchs as $match) {
                    // Supprimer les buts et cartons
                    \App\Models\CoupeBut::where('coupe_match_id', $match->id)->delete();
                    \App\Models\CoupeCarton::where('coupe_match_id', $match->id)->delete();
                }
                // Supprimer les matchs
                $round->matchs()->delete();
            }
            // Supprimer les rounds
            $phaseFinale->rounds()->delete();
            // Supprimer les relations avec les équipes
            $phaseFinale->equipes()->detach();
            // Supprimer la phase finale
            $phaseFinale->delete();
        }
        
        // Supprimer toutes les poules et leurs données associées
        foreach ($coupes_avec_poule->poules as $poule) {
            // Supprimer les matchs de poule et leurs données associées
            foreach ($poule->matchs as $match) {
                // Supprimer les buts et cartons
                \App\Models\PouleBut::where('poule_match_id', $match->id)->delete();
                \App\Models\PouleCarton::where('poule_match_id', $match->id)->delete();
            }
            // Supprimer les matchs
            $poule->matchs()->delete();
            // Supprimer les relations avec les équipes
            $poule->equipes()->detach();
            // Supprimer la poule
            $poule->delete();
        }
        
        // Supprimer la coupe avec poules
        $coupes_avec_poule->delete();
        
        return redirect()->route('dashboard.coupes-avec-poules.index')
                        ->with('success', 'Tournoi supprimé avec succès.');
    }

    /**
     * Générer les poules et les matchs
     */
    private function genererPoules(CoupeAvecPoule $coupeAvecPoule, array $equipes)
    {
        $nombrePoules = $coupeAvecPoule->nombre_poules;
        $equipesParPoule = count($equipes) / $nombrePoules;
        
        // Mélanger les équipes seulement si matchs_aleatoires est true
        if ($coupeAvecPoule->matchs_aleatoires) {
            shuffle($equipes);
        }
        
        // Créer les poules
        for ($i = 0; $i < $nombrePoules; $i++) {
            $poule = Poule::create([
                'coupe_avec_poule_id' => $coupeAvecPoule->id,
                'nom' => 'Poule ' . chr(65 + $i), // A, B, C, etc.
                'numero' => $i + 1
            ]);
            
            // Assigner les équipes à cette poule
            $equipesPoule = array_slice($equipes, $i * $equipesParPoule, $equipesParPoule);
            $poule->equipes()->attach($equipesPoule);
            
            // Générer les matchs aller-retour
            $this->genererMatchsPoule($poule, $equipesPoule);
        }
    }

    /**
     * Générer les matchs aller-retour pour une poule
     */
    private function genererMatchsPoule(Poule $poule, array $equipes)
    {
        $nombreEquipes = count($equipes);

        // Algorithme du cercle avec bye si impair
        $teams = $equipes;
        $isOdd = $nombreEquipes % 2 === 1;
        if ($isOdd) {
            $teams[] = 0; // bye
        }
        $teamCount = count($teams);
        $rounds = $teamCount - 1; // journées aller
        $half = $teamCount / 2;

        // Aller
        for ($r = 0; $r < $rounds; $r++) {
            $journee = $r + 1;
            for ($i = 0; $i < $half; $i++) {
                $a = $teams[$i];
                $b = $teams[$teamCount - 1 - $i];
                if ($a === 0 || $b === 0) continue; // ignorer bye
                PouleMatch::create([
                    'poule_id' => $poule->id,
                    'journee' => $journee,
                    'equipe_home_id' => $a,
                    'equipe_away_id' => $b,
                    'termine' => false,
                ]);
            }
            // rotation
            $fixed = array_shift($teams);
            $last = array_pop($teams);
            array_unshift($teams, $fixed);
            array_splice($teams, 1, 0, [$last]);
        }

        // Retour: mêmes appariements, inversés, journées qui continuent
        $teams = $equipes;
        if ($isOdd) { $teams[] = 0; }
        for ($r = 0; $r < $rounds; $r++) {
            $journee = $rounds + $r + 1;
            for ($i = 0; $i < $half; $i++) {
                $a = $teams[$i];
                $b = $teams[$teamCount - 1 - $i];
                if ($a === 0 || $b === 0) continue;
                PouleMatch::create([
                    'poule_id' => $poule->id,
                    'journee' => $journee,
                    'equipe_home_id' => $b,
                    'equipe_away_id' => $a,
                    'termine' => false,
                ]);
            }
            // rotation
            $fixed = array_shift($teams);
            $last = array_pop($teams);
            array_unshift($teams, $fixed);
            array_splice($teams, 1, 0, [$last]);
        }
    }
}
