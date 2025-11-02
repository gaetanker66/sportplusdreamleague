<?php

namespace App\Http\Controllers;

use App\Models\PouleMatch;
use App\Models\PouleBut;
use App\Models\PouleCarton;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PouleMatchController extends Controller
{
    public function edit(PouleMatch $poule_match)
    {
        $poule_match->load(['homeEquipe', 'awayEquipe', 'buts', 'cartons', 'poule']);

        $gkNames = ['GK', 'Gardien', 'Gardien de but', 'Goalkeeper'];
        $homeGardiens = \App\Models\Joueur::with('poste')
            ->where('equipe_id', $poule_match->equipe_home_id)
            ->whereHas('poste', function ($q) use ($gkNames) { $q->whereIn('nom', $gkNames); })
            ->orderBy('nom')->get(['id','nom','equipe_id','poste_id']);
        $awayGardiens = \App\Models\Joueur::with('poste')
            ->where('equipe_id', $poule_match->equipe_away_id)
            ->whereHas('poste', function ($q) use ($gkNames) { $q->whereIn('nom', $gkNames); })
            ->orderBy('nom')->get(['id','nom','equipe_id','poste_id']);

        $homePlayers = \App\Models\Joueur::where('equipe_id', $poule_match->equipe_home_id)->orderBy('nom')->get(['id','nom']);
        $awayPlayers = \App\Models\Joueur::where('equipe_id', $poule_match->equipe_away_id)->orderBy('nom')->get(['id','nom']);

        $backUrl = route('coupes-avec-poules.show', optional($poule_match->poule)->coupe_avec_poule_id);

        return Inertia::render('poule-matchs/edit', [
            'match' => [
                'id' => $poule_match->id,
                'home_equipe' => optional($poule_match->homeEquipe)->only(['id','nom']),
                'away_equipe' => optional($poule_match->awayEquipe)->only(['id','nom']),
                'equipe_home_id' => $poule_match->equipe_home_id,
                'equipe_away_id' => $poule_match->equipe_away_id,
                'gardien_home_id' => $poule_match->gardien_home_id,
                'gardien_away_id' => $poule_match->gardien_away_id,
                'arrets_home' => (int)($poule_match->arrets_home ?? 0),
                'arrets_away' => (int)($poule_match->arrets_away ?? 0),
                'score_home' => (int)($poule_match->score_home ?? 0),
                'score_away' => (int)($poule_match->score_away ?? 0),
                'termine' => (bool)$poule_match->termine,
                'buts' => $poule_match->buts()->get(['id','equipe_id','buteur_id','passeur_id','minute','type']),
                'cartons' => $poule_match->cartons()->get(['id','joueur_id','type','minute']),
            ],
            'homeGardiens' => $homeGardiens,
            'awayGardiens' => $awayGardiens,
            'homePlayers' => $homePlayers,
            'awayPlayers' => $awayPlayers,
            'backUrl' => $backUrl,
        ]);
    }

    public function update(Request $request, PouleMatch $poule_match)
    {
        $validated = $request->validate([
            'gardien_home_id' => 'nullable|exists:joueurs,id',
            'gardien_away_id' => 'nullable|exists:joueurs,id',
            'arrets_home' => 'nullable|integer|min:0',
            'arrets_away' => 'nullable|integer|min:0',
            'termine' => 'nullable|boolean',
        ]);
        $poule_match->update([
            'gardien_home_id' => $validated['gardien_home_id'] ?? $poule_match->gardien_home_id,
            'gardien_away_id' => $validated['gardien_away_id'] ?? $poule_match->gardien_away_id,
            'arrets_home' => $validated['arrets_home'] ?? $poule_match->arrets_home,
            'arrets_away' => $validated['arrets_away'] ?? $poule_match->arrets_away,
            'termine' => array_key_exists('termine', $validated) ? (bool)$validated['termine'] : $poule_match->termine,
        ]);
        return back()->with('success', 'Mise à jour effectuée.');
    }

    public function addBut(Request $request, PouleMatch $poule_match)
    {
        $validated = $request->validate([
            'equipe_id' => 'required|exists:equipes,id',
            'buteur_id' => 'required|exists:joueurs,id',
            'passeur_id' => 'nullable|exists:joueurs,id',
            'minute' => 'nullable|string|max:10',
            'type' => 'nullable|in:normal,coup_franc,penalty,csc',
        ]);
        $poule_match->buts()->create($validated);
        // recalcul du score simple
        $scoreHome = (int) $poule_match->buts()->where('equipe_id', $poule_match->equipe_home_id)->where('type', '!=', 'csc')->count();
        $scoreAway = (int) $poule_match->buts()->where('equipe_id', $poule_match->equipe_away_id)->where('type', '!=', 'csc')->count();
        $scoreHome += (int) $poule_match->buts()->where('equipe_id', $poule_match->equipe_away_id)->where('type', 'csc')->count();
        $scoreAway += (int) $poule_match->buts()->where('equipe_id', $poule_match->equipe_home_id)->where('type', 'csc')->count();
        $poule_match->update(['score_home' => $scoreHome, 'score_away' => $scoreAway]);
        if ($request->boolean('stay')) {
            return redirect()->route('poule-matchs.edit', $poule_match)->with('success', 'But enregistré.');
        }
        return back()->with('success', 'But enregistré.');
    }

    public function removeBut(Request $request, PouleMatch $poule_match, PouleBut $but)
    {
        $but->delete();
        // recalcule
        $scoreHome = (int) $poule_match->buts()->where('equipe_id', $poule_match->equipe_home_id)->where('type', '!=', 'csc')->count();
        $scoreAway = (int) $poule_match->buts()->where('equipe_id', $poule_match->equipe_away_id)->where('type', '!=', 'csc')->count();
        $scoreHome += (int) $poule_match->buts()->where('equipe_id', $poule_match->equipe_away_id)->where('type', 'csc')->count();
        $scoreAway += (int) $poule_match->buts()->where('equipe_id', $poule_match->equipe_home_id)->where('type', 'csc')->count();
        $poule_match->update(['score_home' => $scoreHome, 'score_away' => $scoreAway]);
        if ($request->boolean('stay')) {
            return redirect()->route('poule-matchs.edit', $poule_match)->with('success', 'But supprimé.');
        }
        return back()->with('success', 'But supprimé.');
    }

    public function addCarton(Request $request, PouleMatch $poule_match)
    {
        $validated = $request->validate([
            'joueur_id' => 'required|exists:joueurs,id',
            'type' => 'required|in:jaune,rouge',
            'minute' => 'nullable|string|max:10',
        ]);
        if ($validated['type'] === 'jaune') {
            $jaunes = $poule_match->cartons()->where('joueur_id', $validated['joueur_id'])->where('type', 'jaune')->count();
            if ($jaunes >= 1) {
                $poule_match->cartons()->where('joueur_id', $validated['joueur_id'])->where('type', 'jaune')->delete();
                $validated['type'] = 'rouge';
            }
        }
        $poule_match->cartons()->create($validated);
        if ($request->boolean('stay')) {
            return redirect()->route('poule-matchs.edit', $poule_match)->with('success', 'Carton ajouté.');
        }
        return back()->with('success', 'Carton ajouté.');
    }

    public function removeCarton(PouleMatch $poule_match, PouleCarton $carton)
    {
        $carton->delete();
        if (request()->boolean('stay')) {
            return redirect()->route('poule-matchs.edit', $poule_match)->with('success', 'Carton supprimé.');
        }
        return back()->with('success', 'Carton supprimé.');
    }
}


