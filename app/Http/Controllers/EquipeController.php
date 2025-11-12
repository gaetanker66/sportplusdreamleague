<?php

namespace App\Http\Controllers;

use App\Models\Equipe;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipeController extends Controller
{
    public function index()
    {
        // Optimisation : ne pas charger les logos pour éviter l'épuisement mémoire
        $equipes = Equipe::select('id', 'nom', 'created_at', 'updated_at')->orderBy('created_at', 'desc')->get();
        return Inertia::render('equipes/index', compact('equipes'));
    }

    public function create()
    {
        // Charger toutes les équipes pour le sélecteur de rival (sans logos pour optimiser)
        $equipes = Equipe::select('id', 'nom')->orderBy('nom')->get();
        return Inertia::render('equipes/create', compact('equipes'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'rivales' => 'nullable|array',
            'rivales.*' => 'exists:equipes,id',
        ]);

        $equipe = Equipe::create($validated);

        // Synchroniser les rivales (relation bidirectionnelle)
        if (!empty($validated['rivales'])) {
            $rivalesIds = array_filter($validated['rivales'], function($id) use ($equipe) {
                return $id != $equipe->id; // Empêcher qu'une équipe soit rivale d'elle-même
            });
            
            $equipe->rivales()->sync($rivalesIds);
            
            // Créer les relations inverses (si A est rivale de B, alors B est aussi rivale de A)
            foreach ($rivalesIds as $rivaleId) {
                $rivale = Equipe::find($rivaleId);
                if ($rivale) {
                    $rivale->rivales()->syncWithoutDetaching([$equipe->id]);
                }
            }
        }

        return redirect()->route('dashboard.equipes.index')->with('success', 'Équipe créée avec succès.');
    }

    public function show(Equipe $equipe)
    {
        $equipe->load(['joueurs.poste', 'rivales']);
        
        // Calculer les palmarès
        $palmares = $this->calculerPalmares($equipe);
        
        return Inertia::render('equipes/show', compact('equipe', 'palmares'));
    }

    /**
     * Calculer les palmarès d'une équipe
     */
    private function calculerPalmares(Equipe $equipe)
    {
        $palmares = [
            'saisons_ligues' => [],
            'coupes' => [],
        ];

        // Palmarès en ligues (saisons où l'équipe est première)
        $saisons = \App\Models\Saison::with(['ligue', 'equipes', 'journees.matchs'])->get();
        
        foreach ($saisons as $saison) {
            // Vérifier que la saison est terminée
            if ($saison->status !== 'terminé') {
                continue;
            }
            
            if (!$saison->equipes->contains($equipe)) {
                continue;
            }

            // Calculer le classement
            $stats = [];
            foreach ($saison->equipes as $e) {
                $stats[$e->id] = [
                    'pts' => 0,
                    'diff' => 0,
                    'bp' => 0,
                    'nom' => $e->nom
                ];
            }

            foreach ($saison->journees as $journee) {
                foreach ($journee->matchs as $m) {
                    if (!$m->termine) continue;
                    $h = $m->equipe_home_id;
                    $a = $m->equipe_away_id;
                    $sh = (int)$m->score_home;
                    $sa = (int)$m->score_away;
                    
                    if (!isset($stats[$h]) || !isset($stats[$a])) continue;
                    
                    $stats[$h]['bp'] += $sh;
                    $stats[$a]['bp'] += $sa;
                    $stats[$h]['diff'] += ($sh - $sa);
                    $stats[$a]['diff'] += ($sa - $sh);
                    
                    if ($sh > $sa) {
                        $stats[$h]['pts'] += 3;
                    } elseif ($sh < $sa) {
                        $stats[$a]['pts'] += 3;
                    } else {
                        $stats[$h]['pts'] += 1;
                        $stats[$a]['pts'] += 1;
                    }
                }
            }

            // Trier par points, différence, buts pour
            uasort($stats, function($x, $y) {
                if ($x['pts'] !== $y['pts']) return $y['pts'] <=> $x['pts'];
                if ($x['diff'] !== $y['diff']) return $y['diff'] <=> $x['diff'];
                if ($x['bp'] !== $y['bp']) return $y['bp'] <=> $x['bp'];
                return strcmp($x['nom'], $y['nom']);
            });

            // Vérifier si l'équipe est première
            $orderedIds = array_keys($stats);
            if (count($orderedIds) > 0 && $orderedIds[0] === $equipe->id) {
                $palmares['saisons_ligues'][] = [
                    'saison' => $saison->nom,
                    'ligue' => $saison->ligue->nom ?? 'Ligue inconnue',
                    'annee' => $saison->date_debut ? $saison->date_debut->format('Y') : null,
                ];
            }
        }

        // Palmarès en coupes (coupes où l'équipe a gagné la finale)
        $coupes = \App\Models\Coupe::with(['rounds.matchs.matchRetour', 'modele'])->get();
        
        foreach ($coupes as $coupe) {
            // Trouver le round final (round avec le numéro le plus élevé)
            $finalRound = $coupe->rounds()->orderBy('numero', 'desc')->first();
            
            if (!$finalRound) {
                continue;
            }

            // Chercher tous les matchs du round final pour vérifier s'ils sont tous terminés
            $allFinalMatches = $finalRound->matchs()->get();
            
            // Vérifier si au moins une finale est complètement terminée
            $hasCompletedFinal = false;
            foreach ($allFinalMatches as $match) {
                // Pour les matchs aller-retour, vérifier que les deux sont terminés
                if ($match->matchRetour) {
                    if ($match->termine && $match->matchRetour->termine) {
                        $hasCompletedFinal = true;
                        break;
                    }
                } elseif ($match->termine) {
                    // Match unique terminé
                    $hasCompletedFinal = true;
                    break;
                }
                
                // Pour les séries de 3+ matchs, vérifier que tous les matchs de la confrontation sont terminés
                if ($coupe->nombre_matchs >= 3) {
                    $equipe1 = $match->equipe_home_id;
                    $equipe2 = $match->equipe_away_id;
                    $matchsConfrontation = $finalRound->matchs()
                        ->where(function($q) use ($equipe1, $equipe2) {
                            $q->where(function($q2) use ($equipe1, $equipe2) {
                                $q2->where('equipe_home_id', $equipe1)
                                   ->where('equipe_away_id', $equipe2);
                            })->orWhere(function($q2) use ($equipe1, $equipe2) {
                                $q2->where('equipe_home_id', $equipe2)
                                   ->where('equipe_away_id', $equipe1);
                            });
                        })
                        ->get();
                    
                    $allTerminated = $matchsConfrontation->every(function($m) {
                        return $m->termine === true;
                    });
                    
                    if ($allTerminated && $matchsConfrontation->isNotEmpty()) {
                        $hasCompletedFinal = true;
                        break;
                    }
                }
            }
            
            // Ne continuer que si une finale est complètement terminée
            if (!$hasCompletedFinal) {
                continue;
            }
            
            // Filtrer les matchs terminés pour le calcul du vainqueur
            $finalMatches = $finalRound->matchs()->where('termine', true)->get();
            
            foreach ($finalMatches as $match) {
                $winner = null;
                
                // Déterminer le vainqueur selon le type de match
                if ($coupe->nombre_matchs >= 3) {
                    // Série de matchs - utiliser la logique de calculerVainqueurSerie
                    $winner = $this->calculerVainqueurSerie($match, $coupe);
                } else {
                    // Match unique ou aller-retour - s'assurer que les deux sont terminés pour aller-retour
                    if ($match->matchRetour) {
                        if (!$match->matchRetour->termine) {
                            continue; // Passer au match suivant si le retour n'est pas terminé
                        }
                        // Match aller-retour : utiliser score cumulé ou tirs au but
                        $scoreCumuleHome = $match->score_cumule_home ?? 0;
                        $scoreCumuleAway = $match->score_cumule_away ?? 0;
                        
                        if ($scoreCumuleHome > $scoreCumuleAway) {
                            $winner = $match->equipe_home_id;
                        } elseif ($scoreCumuleAway > $scoreCumuleHome) {
                            $winner = $match->equipe_away_id;
                        } else {
                            // Égalité - vérifier tirs au but du match retour
                            $matchRetour = $match->matchRetour;
                            if ($matchRetour && $matchRetour->tirs_au_but_home !== null && $matchRetour->tirs_au_but_away !== null) {
                                if ($matchRetour->tirs_au_but_home > $matchRetour->tirs_au_but_away) {
                                    $winner = $matchRetour->equipe_home_id;
                                } elseif ($matchRetour->tirs_au_but_away > $matchRetour->tirs_au_but_home) {
                                    $winner = $matchRetour->equipe_away_id;
                                }
                            }
                        }
                    } elseif ($match->termine) {
                        // Match unique terminé
                        if ($match->score_home > $match->score_away) {
                            $winner = $match->equipe_home_id;
                        } elseif ($match->score_away > $match->score_home) {
                            $winner = $match->equipe_away_id;
                        } else {
                            // Match nul - vérifier tirs au but
                            if ($match->tirs_au_but_home !== null && $match->tirs_au_but_away !== null) {
                                if ($match->tirs_au_but_home > $match->tirs_au_but_away) {
                                    $winner = $match->equipe_home_id;
                                } elseif ($match->tirs_au_but_away > $match->tirs_au_but_home) {
                                    $winner = $match->equipe_away_id;
                                }
                            }
                        }
                    }
                }

                if ($winner === $equipe->id) {
                    $palmares['coupes'][] = [
                        'coupe' => $coupe->nom,
                        'modele' => $coupe->modele->nom ?? null,
                        'annee' => $coupe->created_at ? $coupe->created_at->format('Y') : null,
                    ];
                    break; // Pas besoin de vérifier les autres matchs finaux de cette coupe
                }
            }
        }

        // Palmarès en coupes avec poules (uniquement victoire en finale, PAS première place de poule)
        // On ne compte que les victoires en phase finale, pas les premières places en poule
        $coupesAvecPoules = \App\Models\CoupeAvecPoule::with('coupePhaseFinale.rounds.matchs.matchRetour', 'modele')->get();
        
        foreach ($coupesAvecPoules as $coupeAvecPoule) {
            // Vérifier qu'une phase finale a été générée
            if (!$coupeAvecPoule->coupePhaseFinale) {
                continue;
            }

            $coupePhaseFinale = $coupeAvecPoule->coupePhaseFinale;
            // Chercher uniquement la finale de la phase finale (pas les poules)
            $finalRound = $coupePhaseFinale->rounds()->orderBy('numero', 'desc')->first();
            
            if (!$finalRound) {
                continue;
            }

            // Chercher tous les matchs du round final pour vérifier s'ils sont tous terminés
            $allFinalMatches = $finalRound->matchs()->get();
            
            // Vérifier si au moins une finale est complètement terminée
            $hasCompletedFinal = false;
            foreach ($allFinalMatches as $match) {
                // Pour les matchs aller-retour, vérifier que les deux sont terminés
                if ($match->matchRetour) {
                    if ($match->termine && $match->matchRetour->termine) {
                        $hasCompletedFinal = true;
                        break;
                    }
                } elseif ($match->termine) {
                    // Match unique terminé
                    $hasCompletedFinal = true;
                    break;
                }
                
                // Pour les séries de 3+ matchs, vérifier que tous les matchs de la confrontation sont terminés
                if ($coupePhaseFinale->nombre_matchs >= 3) {
                    $equipe1 = $match->equipe_home_id;
                    $equipe2 = $match->equipe_away_id;
                    $matchsConfrontation = $finalRound->matchs()
                        ->where(function($q) use ($equipe1, $equipe2) {
                            $q->where(function($q2) use ($equipe1, $equipe2) {
                                $q2->where('equipe_home_id', $equipe1)
                                   ->where('equipe_away_id', $equipe2);
                            })->orWhere(function($q2) use ($equipe1, $equipe2) {
                                $q2->where('equipe_home_id', $equipe2)
                                   ->where('equipe_away_id', $equipe1);
                            });
                        })
                        ->get();
                    
                    $allTerminated = $matchsConfrontation->every(function($m) {
                        return $m->termine === true;
                    });
                    
                    if ($allTerminated && $matchsConfrontation->isNotEmpty()) {
                        $hasCompletedFinal = true;
                        break;
                    }
                }
            }
            
            // Ne continuer que si une finale est complètement terminée
            if (!$hasCompletedFinal) {
                continue;
            }
            
            // Filtrer les matchs terminés pour le calcul du vainqueur
            $finalMatches = $finalRound->matchs()->where('termine', true)->get();
            
            foreach ($finalMatches as $match) {
                $winner = null;
                
                if ($coupePhaseFinale->nombre_matchs >= 3) {
                    $winner = $this->calculerVainqueurSerie($match, $coupePhaseFinale);
                } else {
                    // Match unique ou aller-retour - s'assurer que les deux sont terminés pour aller-retour
                    if ($match->matchRetour) {
                        if (!$match->matchRetour->termine) {
                            continue; // Passer au match suivant si le retour n'est pas terminé
                        }
                        $scoreCumuleHome = $match->score_cumule_home ?? 0;
                        $scoreCumuleAway = $match->score_cumule_away ?? 0;
                        
                        if ($scoreCumuleHome > $scoreCumuleAway) {
                            $winner = $match->equipe_home_id;
                        } elseif ($scoreCumuleAway > $scoreCumuleHome) {
                            $winner = $match->equipe_away_id;
                        } else {
                            $matchRetour = $match->matchRetour;
                            if ($matchRetour && $matchRetour->tirs_au_but_home !== null && $matchRetour->tirs_au_but_away !== null) {
                                if ($matchRetour->tirs_au_but_home > $matchRetour->tirs_au_but_away) {
                                    $winner = $matchRetour->equipe_home_id;
                                } elseif ($matchRetour->tirs_au_but_away > $matchRetour->tirs_au_but_home) {
                                    $winner = $matchRetour->equipe_away_id;
                                }
                            }
                        }
                    } elseif ($match->termine) {
                        if ($match->score_home > $match->score_away) {
                            $winner = $match->equipe_home_id;
                        } elseif ($match->score_away > $match->score_home) {
                            $winner = $match->equipe_away_id;
                        } else {
                            if ($match->tirs_au_but_home !== null && $match->tirs_au_but_away !== null) {
                                if ($match->tirs_au_but_home > $match->tirs_au_but_away) {
                                    $winner = $match->equipe_home_id;
                                } elseif ($match->tirs_au_but_away > $match->tirs_au_but_home) {
                                    $winner = $match->equipe_away_id;
                                }
                            }
                        }
                    }
                }

                if ($winner === $equipe->id) {
                    $palmares['coupes'][] = [
                        'coupe' => $coupeAvecPoule->nom,
                        'modele' => $coupeAvecPoule->modele->nom ?? null,
                        'annee' => $coupeAvecPoule->created_at ? $coupeAvecPoule->created_at->format('Y') : null,
                    ];
                    break;
                }
            }
        }

        // Trier les palmarès par année (décroissant)
        usort($palmares['saisons_ligues'], function($a, $b) {
            $anneeA = $a['annee'] ?? '0';
            $anneeB = $b['annee'] ?? '0';
            return $anneeB <=> $anneeA;
        });

        usort($palmares['coupes'], function($a, $b) {
            $anneeA = $a['annee'] ?? '0';
            $anneeB = $b['annee'] ?? '0';
            return $anneeB <=> $anneeA;
        });

        return $palmares;
    }

    /**
     * Calculer le vainqueur d'une série de matchs (3+ matchs)
     * Copie de la méthode dans CoupeController
     */
    private function calculerVainqueurSerie($match, $coupe)
    {
        $round = $match->round;
        
        // Trouver tous les matchs de cette confrontation
        $equipe1 = $match->equipe_home_id;
        $equipe2 = $match->equipe_away_id;
        
        $matchsConfrontation = $round->matchs()
            ->where(function($q) use ($equipe1, $equipe2) {
                $q->where(function($q2) use ($equipe1, $equipe2) {
                    $q2->where('equipe_home_id', $equipe1)
                       ->where('equipe_away_id', $equipe2);
                })->orWhere(function($q2) use ($equipe1, $equipe2) {
                    $q2->where('equipe_home_id', $equipe2)
                       ->where('equipe_away_id', $equipe1);
                });
            })
            ->where('termine', true)
            ->orderBy('numero_match')
            ->get();
        
        if ($matchsConfrontation->isEmpty()) {
            return null;
        }
        
        if ($coupe->victoire_uniquement) {
            // Mode "victoire uniquement" : compter SEULEMENT les victoires
            $victoiresEquipe1 = 0;
            $victoiresEquipe2 = 0;
            
            foreach ($matchsConfrontation as $matchConfrontation) {
                if ($matchConfrontation->score_home > $matchConfrontation->score_away) {
                    if ($matchConfrontation->equipe_home_id == $equipe1) {
                        $victoiresEquipe1++;
                    } else {
                        $victoiresEquipe2++;
                    }
                } elseif ($matchConfrontation->score_away > $matchConfrontation->score_home) {
                    if ($matchConfrontation->equipe_away_id == $equipe1) {
                        $victoiresEquipe1++;
                    } else {
                        $victoiresEquipe2++;
                    }
                }
            }
            
            if ($victoiresEquipe1 > $victoiresEquipe2) {
                return $equipe1;
            } elseif ($victoiresEquipe2 > $victoiresEquipe1) {
                return $equipe2;
            } else {
                // Égalité en victoires - vérifier les tirs au but du dernier match
                $dernierMatch = $matchsConfrontation->last();
                if ($dernierMatch->tirs_au_but_home !== null && $dernierMatch->tirs_au_but_away !== null) {
                    if ($dernierMatch->tirs_au_but_home > $dernierMatch->tirs_au_but_away) {
                        return $dernierMatch->equipe_home_id;
                    } elseif ($dernierMatch->tirs_au_but_away > $dernierMatch->tirs_au_but_home) {
                        return $dernierMatch->equipe_away_id;
                    }
                }
                return null;
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
                return null;
            }
        }
    }

    public function edit(Equipe $equipe)
    {
        $equipe->load(['joueurs.poste', 'joueurs.postesSecondaires', 'rivales']);
        $postes = \App\Models\Poste::orderBy('nom')->get();
        // Charger toutes les équipes pour le sélecteur de rivales (sans logos pour optimiser), exclure l'équipe actuelle
        $equipes = Equipe::select('id', 'nom')->where('id', '!=', $equipe->id)->orderBy('nom')->get();
        return Inertia::render('equipes/edit', compact('equipe', 'postes', 'equipes'));
    }

    public function update(Request $request, Equipe $equipe)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'rivales' => 'nullable|array',
            'rivales.*' => 'exists:equipes,id',
            'players' => 'array',
            'players.*.id' => 'required|exists:joueurs,id',
            'players.*.nom' => 'required|string|max:255',
            'players.*.poste_id' => 'nullable|exists:postes,id',
            'players.*.photo' => 'nullable|string',
            'players.*.description' => 'nullable|string',
            'players.*.postes_secondaires' => 'array',
            'players.*.postes_secondaires.*' => 'exists:postes,id',
        ]);

        // Récupérer les anciennes rivales avant la mise à jour
        $anciennesRivalesIds = $equipe->rivales->pluck('id')->toArray();

        $equipe->update($request->only('nom', 'logo', 'description'));

        // Gestion de la synchronisation des rivales (relation bidirectionnelle)
        $nouvellesRivalesIds = !empty($validated['rivales']) 
            ? array_filter($validated['rivales'], function($id) use ($equipe) {
                return $id != $equipe->id; // Empêcher qu'une équipe soit rivale d'elle-même
            })
            : [];

        // Synchroniser les rivales
        $equipe->rivales()->sync($nouvellesRivalesIds);

        // Gérer les relations inverses
        // Supprimer les relations inverses pour les anciennes rivales qui ne sont plus rivales
        $rivalesSupprimees = array_diff($anciennesRivalesIds, $nouvellesRivalesIds);
        foreach ($rivalesSupprimees as $rivaleId) {
            $rivale = Equipe::find($rivaleId);
            if ($rivale) {
                $rivale->rivales()->detach($equipe->id);
            }
        }

        // Ajouter les relations inverses pour les nouvelles rivales
        $nouvellesRivales = array_diff($nouvellesRivalesIds, $anciennesRivalesIds);
        foreach ($nouvellesRivales as $rivaleId) {
            $rivale = Equipe::find($rivaleId);
            if ($rivale) {
                $rivale->rivales()->syncWithoutDetaching([$equipe->id]);
            }
        }

        if ($request->filled('players')) {
            foreach ($request->input('players') as $pl) {
                $joueur = $equipe->joueurs()->find($pl['id']);
                if (!$joueur) {
                    continue;
                }
                $joueur->update([
                    'nom' => $pl['nom'],
                    'poste_id' => $pl['poste_id'] ?? null,
                    'photo' => $pl['photo'] ?? null,
                    'description' => $pl['description'] ?? null,
                ]);
                // Toujours synchroniser pour gérer l'effacement aussi
                $joueur->postesSecondaires()->sync($pl['postes_secondaires'] ?? []);
            }
        }

        return redirect()->route('dashboard.equipes.index')->with('success', 'Équipe mise à jour avec succès.');
    }

    public function destroy(Equipe $equipe)
    {
        $equipe->delete();
        return redirect()->route('dashboard.equipes.index')->with('success', 'Équipe supprimée avec succès.');
    }

    // Joueurs inline
    public function addPlayer(Request $request, Equipe $equipe)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'poste_id' => 'nullable|exists:postes,id',
            'photo' => 'nullable|string',
            'description' => 'nullable|string',
            'postes_secondaires' => 'array',
            'postes_secondaires.*' => 'exists:postes,id',
        ]);

        $joueur = $equipe->joueurs()->create([
            'nom' => $validated['nom'],
            'poste_id' => $validated['poste_id'] ?? null,
            'photo' => $validated['photo'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        if (!empty($validated['postes_secondaires'])) {
            $joueur->postesSecondaires()->sync($validated['postes_secondaires']);
        }
        return back()->with('success', 'Joueur ajouté.');
    }

    public function updatePlayer(Request $request, Equipe $equipe, $joueurId)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'poste_id' => 'nullable|exists:postes,id',
            'photo' => 'nullable|string',
            'description' => 'nullable|string',
            'postes_secondaires' => 'array',
            'postes_secondaires.*' => 'exists:postes,id',
        ]);

        $joueur = $equipe->joueurs()->findOrFail($joueurId);
        $joueur->update([
            'nom' => $validated['nom'],
            'poste_id' => $validated['poste_id'] ?? null,
            'photo' => $validated['photo'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        // Synchroniser systématiquement, y compris pour effacer quand vide
        $joueur->postesSecondaires()->sync($request->input('postes_secondaires', []));
        return back()->with('success', 'Joueur mis à jour.');
    }

    public function deletePlayer(Equipe $equipe, $joueurId)
    {
        $joueur = $equipe->joueurs()->findOrFail($joueurId);
        $joueur->delete();
        return back()->with('success', 'Joueur supprimé.');
    }

    /**
     * API : Récupérer les logos des équipes par leurs IDs
     */
    public function getLogos(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:equipes,id',
        ]);

        $equipes = Equipe::whereIn('id', $validated['ids'])
            ->select('id', 'logo')
            ->get()
            ->mapWithKeys(function ($equipe) {
                return [$equipe->id => $equipe->logo];
            });

        return response()->json($equipes);
    }
}


