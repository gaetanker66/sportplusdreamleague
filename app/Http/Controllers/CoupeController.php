<?php

namespace App\Http\Controllers;

use App\Models\Coupe;
use App\Models\CoupeRound;
use App\Models\CoupeMatch;
use App\Models\CoupeBut;
use App\Models\CoupeModele;
use App\Models\Saison;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CoupeController extends Controller
{
    public function index()
    {
        // Optimisation : ne pas charger les logos pour éviter l'épuisement mémoire
        $coupes = Coupe::with(['modele' => function($q) { $q->select('id', 'nom', 'description'); }])->get();
        return Inertia::render('coupes/index', compact('coupes'));
    }

    public function create()
    {
        // Optimisation : ne pas charger les logos pour éviter l'épuisement mémoire
        $modeles = CoupeModele::where('actif', true)->select('id', 'nom', 'description')->orderBy('nom')->get();
        $equipes = \App\Models\Equipe::select('id', 'nom')->orderBy('nom')->get();
        return Inertia::render('coupes/create', compact('modeles','equipes'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'nombre_equipes' => 'required|integer|min:2',
            'coupe_modele_id' => 'nullable|exists:coupe_modeles,id',
            'equipes' => 'array',
            'equipes.*' => 'exists:equipes,id',
            'matchs_aleatoires' => 'boolean',
            'nombre_matchs' => 'required|integer|min:1|max:7',
            'victoire_uniquement' => 'boolean',
        ]);
        $coupe = Coupe::create($request->only('nom','nombre_equipes','coupe_modele_id','matchs_aleatoires','nombre_matchs','victoire_uniquement'));
        $equipes = $request->input('equipes', []);
        $syncData = [];
        foreach ($equipes as $index => $equipeId) {
            $syncData[$equipeId] = ['ordre' => $index + 1];
        }
        $coupe->equipes()->sync($syncData);
        return redirect()->route('dashboard.coupes.edit', $coupe)->with('success', 'Coupe créée avec succès.');
    }

    public function edit(Coupe $coupe)
    {
        // Optimisation : ne pas charger les logos pour éviter l'épuisement mémoire
        $coupe->load([
            'equipes' => function($q) { 
                $q->select('equipes.id', 'equipes.nom')
                  ->orderBy('coupe_equipe.ordre'); 
            },
            'rounds.matchs.homeEquipe' => function($q) { $q->select('equipes.id', 'equipes.nom'); },
            'rounds.matchs.awayEquipe' => function($q) { $q->select('equipes.id', 'equipes.nom'); },
            'rounds.matchs.matchRetour.homeEquipe' => function($q) { $q->select('equipes.id', 'equipes.nom'); },
            'rounds.matchs.matchRetour.awayEquipe' => function($q) { $q->select('equipes.id', 'equipes.nom'); },
        ]);
        $equipes = \App\Models\Equipe::select('id', 'nom')->orderBy('nom')->get();
        
        // Ajouter la propriété hasBracket pour savoir si l'arbre est généré
        $coupe->hasBracket = $coupe->rounds->count() > 0;
        
        return Inertia::render('coupes/edit', compact('coupe','equipes'));
    }

    // Générer le bracket (arbre) 1/8, 1/4 ... en élimination directe
    public function generateBracket(Request $request, Coupe $coupe)
    {
        // Réinitialiser l'arbre s'il existe
        foreach ($coupe->rounds as $r) { $r->matchs()->delete(); }
        $coupe->rounds()->delete();

        // Récupérer les équipes dans l'ordre défini si matchs_aleatoires est false
        if ($coupe->matchs_aleatoires) {
            $equipes = $coupe->equipes()->pluck('equipes.id')->all();
            shuffle($equipes);
        } else {
            // Respecter l'ordre défini dans la table pivot
            $equipes = $coupe->equipes()->orderBy('coupe_equipe.ordre')->pluck('equipes.id')->all();
        }
        
        $n = count($equipes);
        if ($n < 2) return back()->withErrors(['equipes' => 'Sélectionnez au moins 2 équipes.']);

        // Arrondir à la puissance de 2 SUPÉRIEURE et gérer les byes
        $m = 1; while ($m < $n) { $m *= 2; } // ex: 6 -> 8
        $byes = $m - $n; // équipes qui passent d'office

        // Préparer le tableau de têtes de série: compléter avec null pour byes
        $seeded = $equipes;
        for ($i = 0; $i < $byes; $i++) { $seeded[] = null; }

        // Nombre de rounds
        $roundCount = 0; $tmp = $m; while ($tmp > 1) { $tmp /= 2; $roundCount++; }

        $rounds = [];
        for ($r = 1; $r <= $roundCount; $r++) {
            $teamsThisRound = $m / (2 ** ($r - 1));
            $label = match($teamsThisRound) {
                2 => 'Finale',
                4 => 'Demi-finales',
                8 => 'Quarts',
                16 => '1/8',
                32 => '1/16',
                default => "Round $r",
            };
            $rounds[$r] = $coupe->rounds()->create(['numero' => $r, 'label' => $label]);
            $matchesCount = $teamsThisRound / 2;
            if ($r === 1) {
                for ($i = 0; $i < $matchesCount; $i++) {
                    $home = $seeded[$i*2] ?? null; $away = $seeded[$i*2 + 1] ?? null;
                    
                    // Créer les matchs selon le nombre configuré
                    $this->creerMatchsConfrontation($rounds[$r], $home, $away, $coupe->nombre_matchs, $coupe->victoire_uniquement);
                }
            } elseif ($r === $roundCount) {
                // Finale : un seul match
                for ($i = 0; $i < $matchesCount; $i++) {
                    $rounds[$r]->matchs()->create([
                        'is_aller' => true, // Pas de retour pour la finale
                    ]);
                }
            } else {
                // Autres rounds : aller-retour
                for ($i = 0; $i < $matchesCount; $i++) {
                    // Créer le match aller
                    $matchAller = $rounds[$r]->matchs()->create([
                        'is_aller' => true,
                    ]);
                    
                    // Créer le match retour
                    $matchRetour = $rounds[$r]->matchs()->create([
                        'is_aller' => false,
                        'match_retour_id' => $matchAller->id,
                    ]);
                    
                    // Lier le match aller au retour
                    $matchAller->update(['match_retour_id' => $matchRetour->id]);
                }
            }
        }

        // Avancer automatiquement les byes (matchs avec null)
        if ($roundCount >= 2) {
            $first = $rounds[1]->matchs()->get();
            $winners = [];
            foreach ($first as $mch) {
                $h = $mch->equipe_home_id; $a = $mch->equipe_away_id;
                if ($h && !$a) { $winners[] = $h; }
                elseif ($a && !$h) { $winners[] = $a; }
            }
            if (!empty($winners)) {
                $next = $rounds[2]->matchs()->get();
                $i = 0; foreach ($next as $nm) {
                    $home = $winners[$i++] ?? $nm->equipe_home_id; $away = $winners[$i++] ?? $nm->equipe_away_id;
                    $nm->update(['equipe_home_id' => $home, 'equipe_away_id' => $away]);
                }
            }
        }
        return back()->with('success','Arbre généré.');
    }

    // Avancer les vainqueurs d'un round au suivant (après saisie des scores)
    public function advanceWinners(Request $request, CoupeRound $round)
    {
        $coupe = $round->coupe;
        $next = $coupe->rounds()->where('numero', $round->numero + 1)->first();
        if (!$next) return back()->withErrors(['round' => 'Round suivant introuvable.']);
        $matchs = $round->matchs()->get();
        $winners = [];
        foreach ($matchs as $m) {
            if (!$m->termine) continue;
            if ($m->score_home === $m->score_away) continue; // pas d'égalité pour avancer
            $winners[] = $m->score_home > $m->score_away ? $m->equipe_home_id : $m->equipe_away_id;
        }
        // renseigner les équipes gagnantes dans les matchs du round suivant
        $i = 0; foreach ($next->matchs as $nm) {
            $home = $winners[$i++] ?? null; $away = $winners[$i++] ?? null;
            $nm->update(['equipe_home_id' => $home, 'equipe_away_id' => $away]);
        }
        return back()->with('success','Vainqueurs avancés.');
    }

    public function updateMatch(Request $request, CoupeMatch $match)
    {
        $validated = $request->validate([
            'score_home' => 'nullable|integer|min:0',
            'score_away' => 'nullable|integer|min:0',
            'termine' => 'nullable|boolean',
            'gardien_home_id' => 'nullable|exists:joueurs,id',
            'gardien_away_id' => 'nullable|exists:joueurs,id',
            'arrets_home' => 'nullable|integer|min:0',
            'arrets_away' => 'nullable|integer|min:0',
            'is_fake' => 'nullable|boolean',
            'tirs_au_but_home' => 'nullable|integer|min:0',
            'tirs_au_but_away' => 'nullable|integer|min:0',
            'homme_du_match_id' => 'nullable|exists:joueurs,id',
        ]);
        // Gestion des cas 0/1 équipe
        $homeId = $match->equipe_home_id; $awayId = $match->equipe_away_id;
        if (!$homeId && !$awayId) {
            return back()->withErrors(['match' => "Aucune équipe définie pour ce match."]);
        }

        $payload = [
            'score_home' => $validated['score_home'] ?? $match->score_home,
            'score_away' => $validated['score_away'] ?? $match->score_away,
            'termine' => array_key_exists('termine', $validated) ? (bool)$validated['termine'] : $match->termine,
            'gardien_home_id' => array_key_exists('gardien_home_id', $validated) ? $validated['gardien_home_id'] : $match->gardien_home_id,
            'gardien_away_id' => array_key_exists('gardien_away_id', $validated) ? $validated['gardien_away_id'] : $match->gardien_away_id,
            'arrets_home' => array_key_exists('arrets_home', $validated) ? (int)($validated['arrets_home'] ?? 0) : $match->arrets_home,
            'arrets_away' => array_key_exists('arrets_away', $validated) ? (int)($validated['arrets_away'] ?? 0) : $match->arrets_away,
            'is_fake' => array_key_exists('is_fake', $validated) ? (bool)$validated['is_fake'] : ($match->is_fake ?? false),
            'tirs_au_but_home' => array_key_exists('tirs_au_but_home', $validated) ? ($validated['tirs_au_but_home'] ?: null) : $match->tirs_au_but_home,
            'tirs_au_but_away' => array_key_exists('tirs_au_but_away', $validated) ? ($validated['tirs_au_but_away'] ?: null) : $match->tirs_au_but_away,
            'homme_du_match_id' => array_key_exists('homme_du_match_id', $validated) ? $validated['homme_du_match_id'] : $match->homme_du_match_id,
        ];

        if (($homeId && !$awayId) || ($awayId && !$homeId)) {
            $winner = $homeId ?: $awayId;
            $payload['is_fake'] = true; // ne sera pas compté dans les stats
            $payload['termine'] = true;
            $match->update($payload);

            // Avancer automatiquement au prochain tour
            $round = $match->round; $coupe = $round->coupe;
            $next = $coupe->rounds()->where('numero', $round->numero + 1)->first();
            if ($next) {
                $index = $round->matchs()->orderBy('id')->pluck('id')->search($match->id) ?? 0;
                $target = $next->matchs()->orderBy('id')->get()[(int) floor($index/2)] ?? null;
                if ($target) {
                    if ($index % 2 === 0) { $target->update(['equipe_home_id' => $winner]); }
                    else { $target->update(['equipe_away_id' => $winner]); }
                }
            }
        } else {
            $match->update($payload);
            
            $round = $match->round;
            $coupe = $round->coupe;
            
            // Recalculer automatiquement tous les vainqueurs après chaque modification
            \Log::info("updateMatch: Recalcul automatique après modification du match {$match->id}");
            $this->recalculerVainqueurs($coupe);
        }
        // Rediriger vers l'édition de la coupe
        $coupeId = optional(optional($match->round)->coupe)->id;
        if ($coupeId) {
            return redirect()->route('dashboard.coupes.edit', $coupeId)->with('success', 'Match mis à jour.');
        }
        return back()->with('success', 'Match mis à jour.');
    }

    public function update(Request $request, Coupe $coupe)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'nombre_equipes' => 'sometimes|integer|min:2',
            'equipes' => 'array',
            'equipes.*' => 'exists:equipes,id',
        ]);
        $coupe->update($request->only('nom','nombre_equipes'));
        if ($request->has('equipes')) {
            $equipes = $request->input('equipes', []);
            $syncData = [];
            foreach ($equipes as $index => $equipeId) {
                $syncData[$equipeId] = ['ordre' => $index + 1];
            }
            $coupe->equipes()->sync($syncData);
        }
        return back()->with('success','Coupe mise à jour.');
    }

    public function editMatch(CoupeMatch $match)
    {
        $match->load(['round.coupe','homeEquipe','awayEquipe','buts','cartons','matchRetour']);
        $gkNames = ['GK', 'Gardien', 'Gardien de but', 'Goalkeeper'];
        $homeGardiens = \App\Models\Joueur::with('poste')
            ->where('equipe_id', $match->equipe_home_id)
            ->whereHas('poste', function ($q) use ($gkNames) { $q->whereIn('nom', $gkNames); })
            ->orderBy('nom')->get(['id','nom']);
        $awayGardiens = \App\Models\Joueur::with('poste')
            ->where('equipe_id', $match->equipe_away_id)
            ->whereHas('poste', function ($q) use ($gkNames) { $q->whereIn('nom', $gkNames); })
            ->orderBy('nom')->get(['id','nom']);
        
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
                ->get(['id','nom']);
            
            foreach ($gardiensHistoriques as $gk) {
                if ($gk->id == $match->gardien_home_id && !$homeGardiens->contains('id', $gk->id)) {
                    $homeGardiens->push($gk);
                }
                if ($gk->id == $match->gardien_away_id && !$awayGardiens->contains('id', $gk->id)) {
                    $awayGardiens->push($gk);
                }
            }
            
            $homeGardiens = $homeGardiens->unique('id')->sortBy('nom')->values();
            $awayGardiens = $awayGardiens->unique('id')->sortBy('nom')->values();
        }
        
        // Tous les joueurs (pour buteur/passeur)
        $homePlayers = \App\Models\Joueur::where('equipe_id', $match->equipe_home_id)->orderBy('nom')->get(['id','nom']);
        $awayPlayers = \App\Models\Joueur::where('equipe_id', $match->equipe_away_id)->orderBy('nom')->get(['id','nom']);
        
        // Récupérer tous les IDs de joueurs qui ont des buts/cartons dans ce match (même s'ils ont été transférés)
        $joueurIdsButs = $match->buts->pluck('buteur_id')->merge($match->buts->pluck('passeur_id'))->filter()->unique();
        $joueurIdsCartons = $match->cartons->pluck('joueur_id')->unique();
        // Ajouter l'homme du match s'il existe
        $joueurIdsHistoriques = $joueurIdsButs->merge($joueurIdsCartons);
        if ($match->homme_du_match_id) {
            $joueurIdsHistoriques->push($match->homme_du_match_id);
        }
        $joueurIdsHistoriques = $joueurIdsHistoriques->unique();
        
        if ($joueurIdsHistoriques->isNotEmpty()) {
            $joueursHistoriques = \App\Models\Joueur::whereIn('id', $joueurIdsHistoriques)
                ->orderBy('nom')
                ->get(['id','nom']);
            
            foreach ($joueursHistoriques as $j) {
                $hasButHome = $match->buts->contains(function($but) use ($j, $match) {
                    return $but->equipe_id == $match->equipe_home_id && ($but->buteur_id == $j->id || $but->passeur_id == $j->id);
                });
                $hasCartonHome = $match->cartons->contains('joueur_id', $j->id);
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
            
            $homePlayers = $homePlayers->unique('id')->sortBy('nom')->values();
            $awayPlayers = $awayPlayers->unique('id')->sortBy('nom')->values();
        }
        return Inertia::render('coupes/edit-match', [
            'match' => $match,
            'homeGardiens' => $homeGardiens,
            'awayGardiens' => $awayGardiens,
            'homePlayers' => $homePlayers,
            'awayPlayers' => $awayPlayers,
        ]);
    }

    public function addBut(Request $request, CoupeMatch $match)
    {
        $validated = $request->validate([
            'equipe_id' => 'required|exists:equipes,id',
            'buteur_id' => 'required|exists:joueurs,id',
            'passeur_id' => 'nullable|exists:joueurs,id',
            'minute' => 'nullable|string|max:10',
            'type' => 'nullable|in:normal,coup_franc,penalty,csc',
        ]);
        CoupeBut::create(['coupe_match_id' => $match->id] + $validated);
        // recalcul simple du score depuis coupe_buts
        $home = CoupeBut::where('coupe_match_id', $match->id)->where('equipe_id', $match->equipe_home_id)->count();
        $away = CoupeBut::where('coupe_match_id', $match->id)->where('equipe_id', $match->equipe_away_id)->count();
        $match->update(['score_home' => $home, 'score_away' => $away]);
        return back()->with('success', 'But enregistré.');
    }

    public function addCarton(Request $request, CoupeMatch $match)
    {
        $validated = $request->validate([
            'joueur_id' => 'required|exists:joueurs,id',
            'type' => 'required|in:jaune,rouge',
            'minute' => 'nullable|string|max:10',
        ]);
        
        // Déterminer l'équipe du joueur au moment du match en utilisant les transferts
        $joueur = \App\Models\Joueur::findOrFail($validated['joueur_id']);
        // Pour les matchs de coupe, on utilise la date actuelle par défaut
        // (les matchs de coupe n'ont pas de date spécifique dans le modèle)
        $equipeId = $joueur->getEquipeAtDate(\Carbon\Carbon::now());
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
        
        \App\Models\CoupeCarton::create(['coupe_match_id' => $match->id] + $validated);
        return back()->with('success','Carton ajouté.');
    }

    public function removeCarton(CoupeMatch $match, \App\Models\CoupeCarton $carton)
    {
        $carton->delete();
        return back()->with('success','Carton supprimé.');
    }

    public function removeBut(CoupeMatch $match, CoupeBut $but)
    {
        $but->delete();
        $home = CoupeBut::where('coupe_match_id', $match->id)->where('equipe_id', $match->equipe_home_id)->count();
        $away = CoupeBut::where('coupe_match_id', $match->id)->where('equipe_id', $match->equipe_away_id)->count();
        $match->update(['score_home' => $home, 'score_away' => $away]);
        return back()->with('success', 'But supprimé.');
    }

    private function calculerScoreCumule(CoupeMatch $matchAller)
    {
        $matchRetour = $matchAller->matchRetour;
        if (!$matchRetour) return;

        // Calculer le score cumulé
        $scoreCumuleHome = $matchAller->score_home + $matchRetour->score_away;
        $scoreCumuleAway = $matchAller->score_away + $matchRetour->score_home;

        // Mettre à jour les deux matchs avec le score cumulé
        $matchAller->update([
            'score_cumule_home' => $scoreCumuleHome,
            'score_cumule_away' => $scoreCumuleAway,
        ]);
        $matchRetour->update([
            'score_cumule_home' => $scoreCumuleHome,
            'score_cumule_away' => $scoreCumuleAway,
        ]);

        // Déterminer le vainqueur
        $winner = null;
        if ($scoreCumuleHome > $scoreCumuleAway) {
            $winner = $matchAller->equipe_home_id;
        } elseif ($scoreCumuleAway > $scoreCumuleHome) {
            $winner = $matchAller->equipe_away_id;
        } else {
            // En cas d'égalité, utiliser les tirs au but du match retour
            if ($matchRetour->tirs_au_but_home !== null && $matchRetour->tirs_au_but_away !== null) {
                if ($matchRetour->tirs_au_but_home > $matchRetour->tirs_au_but_away) {
                    $winner = $matchRetour->equipe_home_id; // Équipe qui joue à domicile au retour
                } elseif ($matchRetour->tirs_au_but_away > $matchRetour->tirs_au_but_home) {
                    $winner = $matchRetour->equipe_away_id; // Équipe qui joue à l'extérieur au retour
                }
            }
        }

        // Avancer le vainqueur au round suivant
        if ($winner) {
            \Log::info("Avancement du vainqueur: Match {$matchAller->id}, Vainqueur: {$winner}, Score cumulé: {$scoreCumuleHome}-{$scoreCumuleAway}, TAB: {$matchRetour->tirs_au_but_home}-{$matchRetour->tirs_au_but_away}");
            $this->advanceWinner($matchAller, $winner);
        } else {
            \Log::info("Aucun vainqueur déterminé: Match {$matchAller->id}, Score cumulé: {$scoreCumuleHome}-{$scoreCumuleAway}, TAB: {$matchRetour->tirs_au_but_home}-{$matchRetour->tirs_au_but_away}");
        }
    }

    /**
     * Calculer le vainqueur d'une série de matchs (3+ matchs)
     */
    private function calculerVainqueurSerie(CoupeMatch $match)
    {
        $round = $match->round;
        $coupe = $round->coupe;
        
        // Récupérer tous les matchs de la même confrontation (même round, mêmes équipes)
        $matchsConfrontation = $round->matchs()
            ->where(function($query) use ($match) {
                $query->where(function($q) use ($match) {
                    $q->where('equipe_home_id', $match->equipe_home_id)
                      ->where('equipe_away_id', $match->equipe_away_id);
                })->orWhere(function($q) use ($match) {
                    $q->where('equipe_home_id', $match->equipe_away_id)
                      ->where('equipe_away_id', $match->equipe_home_id);
                });
            })
            ->where('is_fake', false) // Exclure les faux matchs
            ->where('termine', true) // Seulement les matchs terminés
            ->orderBy('numero_match')
            ->get();

        if ($matchsConfrontation->isEmpty()) {
            return null;
        }

        // Identifier les deux équipes de la confrontation (peuvent changer de côté entre les matchs)
        $equipe1 = $match->equipe_home_id;
        $equipe2 = $match->equipe_away_id;
        
        if ($coupe->victoire_uniquement) {
            // Mode "victoire uniquement" : compter SEULEMENT les victoires, pas les scores
            $victoiresEquipe1 = 0;
            $victoiresEquipe2 = 0;
            
            foreach ($matchsConfrontation as $matchConfrontation) {
                if ($matchConfrontation->score_home > $matchConfrontation->score_away) {
                    // L'équipe à domicile a gagné
                    if ($matchConfrontation->equipe_home_id == $equipe1) {
                        $victoiresEquipe1++;
                    } else {
                        $victoiresEquipe2++;
                    }
                } elseif ($matchConfrontation->score_away > $matchConfrontation->score_home) {
                    // L'équipe à l'extérieur a gagné
                    if ($matchConfrontation->equipe_away_id == $equipe1) {
                        $victoiresEquipe1++;
                    } else {
                        $victoiresEquipe2++;
                    }
                }
                // Les matchs nuls ne comptent pas du tout en mode "victoire uniquement"
            }
            
            // Déterminer le vainqueur : celui qui a le plus de victoires
            \Log::info("calculerVainqueurSerie: Victoires Équipe1={$victoiresEquipe1}, Victoires Équipe2={$victoiresEquipe2}");
            if ($victoiresEquipe1 > $victoiresEquipe2) {
                \Log::info("calculerVainqueurSerie: Vainqueur = Équipe1 ({$equipe1})");
                return $equipe1;
            } elseif ($victoiresEquipe2 > $victoiresEquipe1) {
                \Log::info("calculerVainqueurSerie: Vainqueur = Équipe2 ({$equipe2})");
                return $equipe2;
            } else {
                // Égalité en victoires - vérifier les tirs au but du dernier match seulement s'ils sont saisis
                $dernierMatch = $matchsConfrontation->last();
                if ($dernierMatch->tirs_au_but_home !== null && $dernierMatch->tirs_au_but_away !== null) {
                    if ($dernierMatch->tirs_au_but_home > $dernierMatch->tirs_au_but_away) {
                        return $dernierMatch->equipe_home_id;
                    } elseif ($dernierMatch->tirs_au_but_away > $dernierMatch->tirs_au_but_home) {
                        return $dernierMatch->equipe_away_id;
                    }
                }
                return null; // Pas de vainqueur déterminé
            }
        } else {
            // Mode normal : compter les buts totaux (scores cumulés)
            $butsEquipe1 = 0;
            $butsEquipe2 = 0;
            
            foreach ($matchsConfrontation as $matchConfrontation) {
                if ($matchConfrontation->equipe_home_id == $equipe1) {
                    $butsEquipe1 += $matchConfrontation->score_home;
                    $butsEquipe2 += $matchConfrontation->score_away;
                } else {
                    $butsEquipe1 += $matchConfrontation->score_away;
                    $butsEquipe2 += $matchConfrontation->score_home;
                }
            }
            
            // Déterminer le vainqueur par score cumulé
            if ($butsEquipe1 > $butsEquipe2) {
                return $equipe1;
            } elseif ($butsEquipe2 > $butsEquipe1) {
                return $equipe2;
            } else {
                // Égalité - vérifier les tirs au but du dernier match
                $dernierMatch = $matchsConfrontation->last();
                if ($dernierMatch->tirs_au_but_home !== null && $dernierMatch->tirs_au_but_away !== null) {
                    if ($dernierMatch->tirs_au_but_home > $dernierMatch->tirs_au_but_away) {
                        return $dernierMatch->equipe_home_id;
                    } elseif ($dernierMatch->tirs_au_but_away > $dernierMatch->tirs_au_but_home) {
                        return $dernierMatch->equipe_away_id;
                    }
                }
                return null; // Pas de vainqueur déterminé
            }
        }
    }

    private function advanceWinner(CoupeMatch $match, $winnerId = null)
    {
        \Log::info("advanceWinner appelé: Match {$match->id}, WinnerId: {$winnerId}");
        if (!$winnerId) {
            // Déterminer le vainqueur basé sur le score cumulé ou les tirs au but du match retour
            if ($match->score_cumule_home > $match->score_cumule_away) {
                $winnerId = $match->equipe_home_id;
            } elseif ($match->score_cumule_away > $match->score_cumule_home) {
                $winnerId = $match->equipe_away_id;
            } else {
                // En cas d'égalité, utiliser les tirs au but du match retour
                $matchRetour = $match->matchRetour;
                if ($matchRetour && $matchRetour->tirs_au_but_home !== null && $matchRetour->tirs_au_but_away !== null) {
                    if ($matchRetour->tirs_au_but_home > $matchRetour->tirs_au_but_away) {
                        $winnerId = $matchRetour->equipe_home_id;
                    } elseif ($matchRetour->tirs_au_but_away > $matchRetour->tirs_au_but_home) {
                        $winnerId = $matchRetour->equipe_away_id;
                    }
                }
            }
        }

        if ($winnerId) {
            $round = $match->round;
            $coupe = $round->coupe;
            $next = $coupe->rounds()->where('numero', $round->numero + 1)->first();
            if ($next) {
                // Pour les séries de 3+ matchs, utiliser une logique différente
                if ($coupe->nombre_matchs >= 3) {
                    // Trouver l'index de cette confrontation parmi toutes les confrontations
                    $allConfrontations = $round->matchs()
                        ->where('numero_match', 1) // Prendre seulement le premier match de chaque confrontation
                        ->orderBy('id')
                        ->get();
                    
                    $confrontationIndex = $allConfrontations->search(function($m) use ($match) {
                        return ($m->equipe_home_id == $match->equipe_home_id && $m->equipe_away_id == $match->equipe_away_id) ||
                               ($m->equipe_home_id == $match->equipe_away_id && $m->equipe_away_id == $match->equipe_home_id);
                    });
                    
                    \Log::info("advanceWinner: Confrontation trouvée à l'index {$confrontationIndex}");
                    
                    if ($confrontationIndex !== false) {
                        // Le match cible dans le round suivant
                        $nextMatches = $next->matchs()->orderBy('id')->get();
                        $target = $nextMatches[$confrontationIndex] ?? null;
                        
                        \Log::info("advanceWinner: Match cible trouvé: " . ($target ? $target->id : 'null'));
                        
                        if ($target) {
                            // Déterminer si c'est l'équipe domicile ou extérieure
                            $isHomeTeam = ($confrontationIndex % 2 === 0);
                            
                            if ($isHomeTeam) {
                                $target->update(['equipe_home_id' => $winnerId]);
                                \Log::info("advanceWinner: Vainqueur {$winnerId} avancé vers match {$target->id} (confrontation {$confrontationIndex}, domicile)");
                            } else {
                                $target->update(['equipe_away_id' => $winnerId]);
                                \Log::info("advanceWinner: Vainqueur {$winnerId} avancé vers match {$target->id} (confrontation {$confrontationIndex}, extérieur)");
                            }
                        }
                    }
                } else {
                    // Logique existante pour les matchs aller-retour et matchs uniques
                    $currentMatches = $round->matchs()->where('is_aller', true)->orderBy('id')->get();
                    $matchIndex = $currentMatches->search(function($m) use ($match) { return $m->id === $match->id; });
                    
                    if ($matchIndex !== false) {
                        // Calculer l'index du match cible dans le round suivant
                        $targetMatchIndex = (int) floor($matchIndex / 2);
                        
                        // Récupérer le match cible
                        $nextMatches = $next->matchs()->where('is_aller', true)->orderBy('id')->get();
                        $target = $nextMatches[$targetMatchIndex] ?? null;
                        
                        if ($target) {
                            // Déterminer si c'est l'équipe domicile ou extérieure
                            $isHomeTeam = ($matchIndex % 2 === 0);
                        
                            if ($isHomeTeam) {
                                $target->update(['equipe_home_id' => $winnerId]);
                                if ($target->matchRetour) {
                                    $target->matchRetour->update(['equipe_away_id' => $winnerId]);
                                }
                            } else {
                                $target->update(['equipe_away_id' => $winnerId]);
                                if ($target->matchRetour) {
                                    $target->matchRetour->update(['equipe_home_id' => $winnerId]);
                                }
                            }
                            
                            \Log::info("Vainqueur {$winnerId} placé dans le match {$target->id} du round suivant (index {$targetMatchIndex}, domicile: " . ($isHomeTeam ? 'oui' : 'non') . ")");
                        }
                    }
                }
            }
        }
    }

    public function recalculerVainqueurs(Coupe $coupe)
    {
        // Recalculer tous les scores cumulés et avancer les vainqueurs
        foreach ($coupe->rounds as $round) {
            if ($coupe->nombre_matchs >= 3) {
                // Pour les séries de 3+ matchs, traiter chaque confrontation unique
                $confrontationsTraitees = [];
                
                foreach ($round->matchs as $match) {
                    // Créer une clé unique pour la confrontation
                    $confrontationKey = min($match->equipe_home_id, $match->equipe_away_id) . '_' . max($match->equipe_home_id, $match->equipe_away_id);
                    
                    if (!in_array($confrontationKey, $confrontationsTraitees)) {
                        $confrontationsTraitees[] = $confrontationKey;
                        $winner = $this->calculerVainqueurSerie($match);
                        if ($winner) {
                            $this->advanceWinner($match, $winner);
                        }
                    }
                }
            } else {
                // Pour les matchs aller-retour et uniques
                foreach ($round->matchs()->where('is_aller', true)->get() as $matchAller) {
                    if ($matchAller->matchRetour && $matchAller->termine && $matchAller->matchRetour->termine) {
                        $this->calculerScoreCumule($matchAller);
                    }
                }
            }
        }
        
        return redirect()->route('dashboard.coupes.edit', $coupe)->with('success', 'Vainqueurs recalculés.');
    }

    public function destroy(Coupe $coupe)
    {
        // Supprimer tous les matchs et leurs données associées
        foreach ($coupe->rounds as $round) {
            // Supprimer les buts
            foreach ($round->matchs as $match) {
                $match->buts()->delete();
                $match->cartons()->delete();
            }
            // Supprimer les matchs
            $round->matchs()->delete();
        }
        // Supprimer les rounds
        $coupe->rounds()->delete();
        // Supprimer les relations avec les équipes
        $coupe->equipes()->detach();
        // Supprimer la coupe
        $coupe->delete();
        
        return redirect()->route('dashboard.coupes.index')->with('success', 'Tournoi supprimé avec succès.');
    }

    /**
     * Créer les matchs d'une confrontation selon le nombre configuré
     */
    private function creerMatchsConfrontation($round, $home, $away, $nombreMatchs, $victoireUniquement)
    {
        if ($nombreMatchs === 1) {
            // Match unique
            $round->matchs()->create([
                'equipe_home_id' => $home,
                'equipe_away_id' => $away,
                'is_aller' => true,
            ]);
        } elseif ($nombreMatchs === 2) {
            // Match aller-retour
            $matchAller = $round->matchs()->create([
                'equipe_home_id' => $home,
                'equipe_away_id' => $away,
                'is_aller' => true,
                'numero_match' => 1,
            ]);
            
            $matchRetour = $round->matchs()->create([
                'equipe_home_id' => $away, // Retour : l'équipe qui était à l'extérieur devient domicile
                'equipe_away_id' => $home,
                'is_aller' => false,
                'numero_match' => 2,
                'match_retour_id' => $matchAller->id, // Lien vers le match aller
            ]);
            
            // Mettre à jour le match aller avec le lien vers le retour
            $matchAller->update(['match_retour_id' => $matchRetour->id]);
        } else {
            // Série de matchs (3, 5, 7)
            for ($i = 1; $i <= $nombreMatchs; $i++) {
                $round->matchs()->create([
                    'equipe_home_id' => $i % 2 === 1 ? $home : $away, // Alternance domicile/extérieur
                    'equipe_away_id' => $i % 2 === 1 ? $away : $home,
                    'is_aller' => true, // Tous les matchs sont considérés comme "aller"
                    'numero_match' => $i, // Numéro du match dans la série
                ]);
            }
        }
    }
}


