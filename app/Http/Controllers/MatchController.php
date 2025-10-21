<?php

namespace App\Http\Controllers;

use App\Models\MatchModel;
use App\Models\But;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function edit(MatchModel $match)
    {
        $match->load(['homeEquipe', 'awayEquipe', 'buts', 'cartons', 'journee.saison']);
        $gkNames = ['GK', 'Gardien', 'Gardien de but', 'Goalkeeper'];
        $homeGardiens = \App\Models\Joueur::with('poste')
            ->where('equipe_id', $match->equipe_home_id)
            ->whereHas('poste', function ($q) use ($gkNames) {
                $q->whereIn('nom', $gkNames);
            })
            ->orderBy('nom')
            ->get(['id','nom','equipe_id','poste_id']);

        $awayGardiens = \App\Models\Joueur::with('poste')
            ->where('equipe_id', $match->equipe_away_id)
            ->whereHas('poste', function ($q) use ($gkNames) {
                $q->whereIn('nom', $gkNames);
            })
            ->orderBy('nom')
            ->get(['id','nom','equipe_id','poste_id']);

        // Joueurs disponibles pour buts/passes (tous les joueurs des équipes)
        $homePlayers = \App\Models\Joueur::where('equipe_id', $match->equipe_home_id)
            ->orderBy('nom')->get(['id','nom']);
        $awayPlayers = \App\Models\Joueur::where('equipe_id', $match->equipe_away_id)
            ->orderBy('nom')->get(['id','nom']);

        return Inertia::render('matchs/edit', [
            'match' => $match,
            'homeGardiens' => $homeGardiens,
            'awayGardiens' => $awayGardiens,
            'homePlayers' => $homePlayers,
            'awayPlayers' => $awayPlayers,
            'saisonId' => optional($match->journee->saison)->id,
            'journeeNumero' => optional($match->journee)->numero,
        ]);
    }
    public function addBut(Request $request, MatchModel $match)
    {
        // Interdit si la saison est terminée
        $saison = optional($match->journee)->saison;
        if ($saison && $saison->status === 'terminé') {
            $url = route('saisons.show', $saison->id) . (optional($match->journee)->numero ? ('#journee-' . $match->journee->numero) : '');
            return Inertia::location($url);
        }
        $validated = $request->validate([
            'equipe_id' => 'required|exists:equipes,id',
            'buteur_id' => 'required|exists:joueurs,id',
            'passeur_id' => 'nullable|exists:joueurs,id',
            'minute' => 'nullable|integer|min:0|max:130',
            'type' => 'nullable|in:normal,coup_franc,penalty,csc',
        ]);
        $match->buts()->create($validated);
        $match->recalculeScore();
        // Rester sur la page d'édition si demandé
        if ($request->boolean('stay')) {
            return redirect()->route('matchs.edit', $match)->with('success', 'But enregistré.');
        }
        $numero = optional($match->journee)->numero;
        $saisonId = optional(optional($match->journee)->saison)->id;
        if ($saisonId) {
            $url = route('saisons.show', $saisonId) . ($numero ? ('#journee-' . $numero) : '');
            return Inertia::location($url);
        }
        return back()->with('success', 'But enregistré.');
    }

    public function addCarton(Request $request, MatchModel $match)
    {
        if (optional(optional($match->journee)->saison)->status === 'terminé') {
            return back();
        }
        $validated = $request->validate([
            'joueur_id' => 'required|exists:joueurs,id',
            'type' => 'required|in:jaune,rouge',
            'minute' => 'nullable|integer|min:0|max:130',
        ]);
        
        // Vérifier si le joueur a déjà 2 cartons jaunes
        if ($validated['type'] === 'jaune') {
            $jaunesCount = $match->cartons()
                ->where('joueur_id', $validated['joueur_id'])
                ->where('type', 'jaune')
                ->count();
            
            if ($jaunesCount >= 1) {
                // Supprimer les cartons jaunes existants
                $match->cartons()
                    ->where('joueur_id', $validated['joueur_id'])
                    ->where('type', 'jaune')
                    ->delete();
                
                // Créer un carton rouge à la place
                $validated['type'] = 'rouge';
            }
        }
        
        $match->cartons()->create($validated);
        if ($request->boolean('stay')) {
            return redirect()->route('matchs.edit', $match)->with('success','Carton ajouté.');
        }
        $numero = optional($match->journee)->numero; $saisonId = optional(optional($match->journee)->saison)->id;
        if ($saisonId) { return Inertia::location(route('saisons.show', $saisonId) . ($numero ? ('#journee-' . $numero) : '')); }
        return back()->with('success','Carton ajouté.');
    }

    public function removeCarton(MatchModel $match, \App\Models\Carton $carton)
    {
        if (optional(optional($match->journee)->saison)->status === 'terminé') {
            return back();
        }
        $carton->delete();
        if (request()->boolean('stay')) {
            return redirect()->route('matchs.edit', $match)->with('success','Carton supprimé.');
        }
        $numero = optional($match->journee)->numero; $saisonId = optional(optional($match->journee)->saison)->id;
        if ($saisonId) { return Inertia::location(route('saisons.show', $saisonId) . ($numero ? ('#journee-' . $numero) : '')); }
        return back()->with('success','Carton supprimé.');
    }

    public function removeBut(Request $request, MatchModel $match, But $but)
    {
        // Interdit si la saison est terminée
        $saison = optional($match->journee)->saison;
        if ($saison && $saison->status === 'terminé') {
            $url = route('saisons.show', $saison->id) . (optional($match->journee)->numero ? ('#journee-' . $match->journee->numero) : '');
            return Inertia::location($url);
        }
        $but->delete();
        $match->recalculeScore();
        // Si on demande explicitement de rester sur la page d'édition
        if ($request->boolean('stay')) {
            return redirect()->route('matchs.edit', $match)->with('success', 'But supprimé.');
        }
        $numero = optional($match->journee)->numero;
        $saisonId = optional(optional($match->journee)->saison)->id;
        if ($saisonId) {
            $url = route('saisons.show', $saisonId) . ($numero ? ('#journee-' . $numero) : '');
            return Inertia::location($url);
        }
        return back()->with('success', 'But supprimé.');
    }

    public function updateGardienEtArrets(Request $request, MatchModel $match)
    {
        // Interdit si la saison est terminée
        $saison = optional($match->journee)->saison;
        if ($saison && $saison->status === 'terminé') {
            $url = route('saisons.show', $saison->id) . (optional($match->journee)->numero ? ('#journee-' . $match->journee->numero) : '');
            return Inertia::location($url);
        }
        $validated = $request->validate([
            'gardien_home_id' => 'nullable|exists:joueurs,id',
            'gardien_away_id' => 'nullable|exists:joueurs,id',
            'arrets_home' => 'nullable|integer|min:0',
            'arrets_away' => 'nullable|integer|min:0',
            'termine' => 'nullable|boolean',
        ]);
        $match->update([
            'gardien_home_id' => $validated['gardien_home_id'] ?? $match->gardien_home_id,
            'gardien_away_id' => $validated['gardien_away_id'] ?? $match->gardien_away_id,
            'arrets_home' => $validated['arrets_home'] ?? $match->arrets_home,
            'arrets_away' => $validated['arrets_away'] ?? $match->arrets_away,
            'termine' => array_key_exists('termine', $validated) ? (bool)$validated['termine'] : $match->termine,
        ]);
        $saisonId = optional(optional($match->journee)->saison)->id;
        $numero = optional($match->journee)->numero;
        if ($saisonId) {
            $url = route('saisons.show', $saisonId) . ($numero ? ('#journee-' . $numero) : '');
            return Inertia::location($url);
        }
        return back()->with('success', 'Mise à jour effectuée.');
    }
}


