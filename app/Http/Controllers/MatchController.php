<?php

namespace App\Http\Controllers;

use App\Models\MatchModel;
use App\Models\But;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
        
        // Charger les gardiens sélectionnés dans le match même s'ils ont été transférés
        $gardienIdsHistoriques = collect();
        if ($match->gardien_home_id) {
            $gardienIdsHistoriques->push($match->gardien_home_id);
        }
        if ($match->gardien_away_id) {
            $gardienIdsHistoriques->push($match->gardien_away_id);
        }
        
        if ($gardienIdsHistoriques->isNotEmpty()) {
            $gardiensHistoriques = \App\Models\Joueur::with('poste')
                ->whereIn('id', $gardienIdsHistoriques)
                ->whereHas('poste', function ($q) use ($gkNames) {
                    $q->whereIn('nom', $gkNames);
                })
                ->whereNotIn('id', $homeGardiens->pluck('id')->merge($awayGardiens->pluck('id')))
                ->orderBy('nom')
                ->get(['id','nom','equipe_id','poste_id']);
            
            // Ajouter aux listes appropriées
            foreach ($gardiensHistoriques as $gk) {
                if ($gk->id == $match->gardien_home_id && !$homeGardiens->contains('id', $gk->id)) {
                    $homeGardiens->push($gk);
                }
                if ($gk->id == $match->gardien_away_id && !$awayGardiens->contains('id', $gk->id)) {
                    $awayGardiens->push($gk);
                }
            }
            
            // Trier à nouveau
            $homeGardiens = $homeGardiens->unique('id')->sortBy('nom')->values();
            $awayGardiens = $awayGardiens->unique('id')->sortBy('nom')->values();
        }

        // Joueurs disponibles pour buts/passes (tous les joueurs des équipes actuelles)
        $homePlayers = \App\Models\Joueur::where('equipe_id', $match->equipe_home_id)
            ->orderBy('nom')->get(['id','nom']);
        $awayPlayers = \App\Models\Joueur::where('equipe_id', $match->equipe_away_id)
            ->orderBy('nom')->get(['id','nom']);
        
        // Récupérer tous les IDs de joueurs qui ont des buts/cartons dans ce match (même s'ils ont été transférés)
        $joueurIdsButs = $match->buts->pluck('buteur_id')->merge($match->buts->pluck('passeur_id'))->filter()->unique();
        $joueurIdsCartons = $match->cartons->pluck('joueur_id')->unique();
        // Ajouter l'homme du match s'il existe
        $joueurIdsHistoriques = $joueurIdsButs->merge($joueurIdsCartons);
        if ($match->homme_du_match_id) {
            $joueurIdsHistoriques->push($match->homme_du_match_id);
        }
        $joueurIdsHistoriques = $joueurIdsHistoriques->unique();
        
        // Charger ces joueurs pour l'affichage (même s'ils ne sont plus dans les équipes)
        if ($joueurIdsHistoriques->isNotEmpty()) {
            $joueursHistoriques = \App\Models\Joueur::whereIn('id', $joueurIdsHistoriques)
                ->orderBy('nom')
                ->get(['id','nom']);
            
            // Ajouter les joueurs historiques aux listes appropriées
            foreach ($joueursHistoriques as $j) {
                $hasButHome = $match->buts->contains(function($but) use ($j, $match) {
                    return $but->equipe_id == $match->equipe_home_id && ($but->buteur_id == $j->id || $but->passeur_id == $j->id);
                });
                $hasCartonHome = $match->cartons->contains(function($carton) use ($j) {
                    return $carton->joueur_id == $j->id;
                });
                if (($hasButHome || $hasCartonHome) && !$homePlayers->contains('id', $j->id)) {
                    $homePlayers->push($j);
                }
                
                $hasButAway = $match->buts->contains(function($but) use ($j, $match) {
                    return $but->equipe_id == $match->equipe_away_id && ($but->buteur_id == $j->id || $but->passeur_id == $j->id);
                });
                if ($hasButAway && !$awayPlayers->contains('id', $j->id)) {
                    $awayPlayers->push($j);
                }
            }
            
            // Enlever les doublons et trier
            $homePlayers = $homePlayers->unique('id')->sortBy('nom')->values();
            $awayPlayers = $awayPlayers->unique('id')->sortBy('nom')->values();
        }

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
            $url = route('dashboard.saisons.show', $saison->id) . (optional($match->journee)->numero ? ('#journee-' . $match->journee->numero) : '');
            return Inertia::location($url);
        }
        $validated = $request->validate([
            'equipe_id' => 'required|exists:equipes,id',
            'buteur_id' => 'required|exists:joueurs,id',
            'passeur_id' => 'nullable|exists:joueurs,id',
            'minute' => 'nullable|string|max:10',
            'type' => 'nullable|in:normal,coup_franc,penalty,csc',
        ]);
        $match->buts()->create($validated);
        $match->recalculeScore();
        // Rester sur la page d'édition si demandé
        if ($request->boolean('stay')) {
            return redirect()->route('dashboard.matchs.edit', $match)->with('success', 'But enregistré.');
        }
        $numero = optional($match->journee)->numero;
        $saisonId = optional(optional($match->journee)->saison)->id;
        if ($saisonId) {
            $url = route('dashboard.saisons.show', $saisonId) . ($numero ? ('#journee-' . $numero) : '');
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
            'minute' => 'nullable|string|max:10',
        ]);
        
        // Déterminer l'équipe du joueur au moment du match en utilisant les transferts
        $joueur = \App\Models\Joueur::findOrFail($validated['joueur_id']);
        $dateMatch = $match->journee && $match->journee->date 
            ? Carbon::parse($match->journee->date)
            : Carbon::now();
        $equipeId = $joueur->getEquipeAtDate($dateMatch);
        $validated['equipe_id'] = $equipeId;
        
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
        
        // Recharger le match avec ses relations pour retourner les données à jour
        $match->refresh();
        $match->load(['homeEquipe', 'awayEquipe', 'buts', 'cartons', 'journee.saison']);
        
        if ($request->boolean('stay')) {
            return redirect()->route('dashboard.matchs.edit', $match)->with('success','Carton ajouté.');
        }
        $numero = optional($match->journee)->numero; $saisonId = optional(optional($match->journee)->saison)->id;
        if ($saisonId) { return Inertia::location(route('dashboard.saisons.show', $saisonId) . ($numero ? ('#journee-' . $numero) : '')); }
        return back()->with('success','Carton ajouté.');
    }

    public function removeCarton(MatchModel $match, \App\Models\Carton $carton)
    {
        if (optional(optional($match->journee)->saison)->status === 'terminé') {
            return back();
        }
        $carton->delete();
        if (request()->boolean('stay')) {
            return redirect()->route('dashboard.matchs.edit', $match)->with('success','Carton supprimé.');
        }
        $numero = optional($match->journee)->numero; $saisonId = optional(optional($match->journee)->saison)->id;
        if ($saisonId) { return Inertia::location(route('dashboard.saisons.show', $saisonId) . ($numero ? ('#journee-' . $numero) : '')); }
        return back()->with('success','Carton supprimé.');
    }

    public function removeBut(Request $request, MatchModel $match, But $but)
    {
        // Interdit si la saison est terminée
        $saison = optional($match->journee)->saison;
        if ($saison && $saison->status === 'terminé') {
            $url = route('dashboard.saisons.show', $saison->id) . (optional($match->journee)->numero ? ('#journee-' . $match->journee->numero) : '');
            return Inertia::location($url);
        }
        $but->delete();
        $match->recalculeScore();
        // Si on demande explicitement de rester sur la page d'édition
        if ($request->boolean('stay')) {
            return redirect()->route('dashboard.matchs.edit', $match)->with('success', 'But supprimé.');
        }
        $numero = optional($match->journee)->numero;
        $saisonId = optional(optional($match->journee)->saison)->id;
        if ($saisonId) {
            $url = route('dashboard.saisons.show', $saisonId) . ($numero ? ('#journee-' . $numero) : '');
            return Inertia::location($url);
        }
        return back()->with('success', 'But supprimé.');
    }

    public function updateGardienEtArrets(Request $request, MatchModel $match)
    {
        // Interdit si la saison est terminée
        $saison = optional($match->journee)->saison;
        if ($saison && $saison->status === 'terminé') {
            $url = route('dashboard.saisons.show', $saison->id) . (optional($match->journee)->numero ? ('#journee-' . $match->journee->numero) : '');
            return Inertia::location($url);
        }
        $validated = $request->validate([
            'gardien_home_id' => 'nullable|exists:joueurs,id',
            'gardien_away_id' => 'nullable|exists:joueurs,id',
            'arrets_home' => 'nullable|integer|min:0',
            'arrets_away' => 'nullable|integer|min:0',
            'termine' => 'nullable|boolean',
            'homme_du_match_id' => 'nullable|exists:joueurs,id',
        ]);
        $match->update([
            'gardien_home_id' => $validated['gardien_home_id'] ?? $match->gardien_home_id,
            'gardien_away_id' => $validated['gardien_away_id'] ?? $match->gardien_away_id,
            'arrets_home' => $validated['arrets_home'] ?? $match->arrets_home,
            'arrets_away' => $validated['arrets_away'] ?? $match->arrets_away,
            'termine' => array_key_exists('termine', $validated) ? (bool)$validated['termine'] : $match->termine,
            'homme_du_match_id' => $validated['homme_du_match_id'] ?? $match->homme_du_match_id,
        ]);
        
        // Si on veut rester sur la page (preserveScroll), retourner back() avec le message
        // Sinon, rediriger vers la page de la saison
        $saisonId = optional(optional($match->journee)->saison)->id;
        $numero = optional($match->journee)->numero;
        
        // Toujours retourner back() avec le message pour que les callbacks fonctionnent
        // Inertia gérera la redirection si nécessaire
        return back()->with('success', 'Match enregistré avec succès.');
    }
}


