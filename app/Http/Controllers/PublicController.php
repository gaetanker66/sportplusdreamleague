<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Ligue;
use App\Models\Saison;
use App\Models\MatchModel;
use App\Models\But;
use App\Models\Joueur;
use App\Models\Coupe;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function classement(Request $request)
    {
        $ligues = Ligue::orderBy('niveau')->get(['id','nom','niveau']);
        if ($ligues->isEmpty()) {
            return Inertia::render('classement', [
                'ligues' => [],
                'saisons' => [],
                'selectedLigueId' => null,
                'selectedSaisonId' => null,
                'standings' => [],
            ]);
        }

        $selectedLigueId = (int)($request->query('ligue_id') ?: $ligues->first()->id);
        $saisons = Saison::where('ligue_id', $selectedLigueId)
            ->orderByDesc('date_debut')
            ->get(['id','nom','date_debut','date_fin','ligue_id']);
        $selectedSaisonId = (int)($request->query('saison_id') ?: ($saisons->first()->id ?? 0));

        $standings = [];
        if ($selectedSaisonId) {
            $saison = Saison::with([
                'equipes' => function($q) { 
                    $q->select('equipes.id', 'equipes.nom', 'equipes.logo'); 
                }, 
                'journees.matchs' => function($query) {
                    $query->select('id', 'journee_id', 'equipe_home_id', 'equipe_away_id', 'score_home', 'score_away', 'termine');
                },
                'journees.matchs.homeEquipe' => function($q) {
                    $q->select('equipes.id', 'equipes.nom', 'equipes.logo');
                },
                'journees.matchs.awayEquipe' => function($q) {
                    $q->select('equipes.id', 'equipes.nom', 'equipes.logo');
                },
            ])
                ->find($selectedSaisonId);
            if ($saison) {
                // Init stats
                foreach ($saison->equipes as $equipe) {
                    $standings[$equipe->id] = [
                        'equipe_id' => $equipe->id,
                        'nom' => $equipe->nom,
                        'logo' => $equipe->logo,
                        'joue' => 0,
                        'gagne' => 0,
                        'nul' => 0,
                        'perdu' => 0,
                        'bp' => 0,
                        'bc' => 0,
                        'diff' => 0,
                        'points' => 0,
                    ];
                }
                // Agrégation sur les matchs de la saison
                foreach ($saison->journees as $journee) {
                    foreach ($journee->matchs as $m) {
                        // Ne compter que les matchs terminés
                        if (!$m->termine) { continue; }
                        $homeId = $m->equipe_home_id; $awayId = $m->equipe_away_id;
                        if (!isset($standings[$homeId]) || !isset($standings[$awayId])) continue;
                        $sh = (int)$m->score_home; $sa = (int)$m->score_away;
                        $standings[$homeId]['joue']++; $standings[$awayId]['joue']++;
                        $standings[$homeId]['bp'] += $sh; $standings[$homeId]['bc'] += $sa;
                        $standings[$awayId]['bp'] += $sa; $standings[$awayId]['bc'] += $sh;
                        if ($sh > $sa) {
                            $standings[$homeId]['gagne']++; $standings[$homeId]['points'] += 3;
                            $standings[$awayId]['perdu']++;
                        } elseif ($sh < $sa) {
                            $standings[$awayId]['gagne']++; $standings[$awayId]['points'] += 3;
                            $standings[$homeId]['perdu']++;
                        } else {
                            $standings[$homeId]['nul']++; $standings[$homeId]['points'] += 1;
                            $standings[$awayId]['nul']++; $standings[$awayId]['points'] += 1;
                        }
                    }
                }
                foreach ($standings as &$st) {
                    $st['diff'] = $st['bp'] - $st['bc'];
                }
                unset($st);
                // Ordonner
                $standings = array_values($standings);
                usort($standings, function($a,$b){
                    if ($a['points'] !== $b['points']) return $b['points'] <=> $a['points'];
                    if ($a['diff'] !== $b['diff']) return $b['diff'] <=> $a['diff'];
                    if ($a['bp'] !== $b['bp']) return $b['bp'] <=> $a['bp'];
                    return strcmp($a['nom'], $b['nom']);
                });

                // Récupérer les derniers matchs terminés (10 derniers)
                $recentMatches = [];
                foreach ($saison->journees as $journee) {
                    foreach ($journee->matchs as $match) {
                        if ($match->termine) {
                            $recentMatches[] = [
                                'id' => $match->id,
                                'journee_numero' => $journee->numero,
                                'equipe_home_id' => $match->equipe_home_id,
                                'equipe_away_id' => $match->equipe_away_id,
                                'home_equipe' => $match->homeEquipe ? ['id' => $match->homeEquipe->id, 'nom' => $match->homeEquipe->nom, 'logo' => $match->homeEquipe->logo] : null,
                                'away_equipe' => $match->awayEquipe ? ['id' => $match->awayEquipe->id, 'nom' => $match->awayEquipe->nom, 'logo' => $match->awayEquipe->logo] : null,
                                'score_home' => $match->score_home,
                                'score_away' => $match->score_away,
                                'termine' => $match->termine,
                            ];
                        }
                    }
                }
                // Trier par date de journée (plus récent d'abord) et limiter à 10
                usort($recentMatches, function($a, $b) {
                    return ($b['journee_numero'] ?? 0) <=> ($a['journee_numero'] ?? 0);
                });
                $recentMatches = array_slice($recentMatches, 0, 10);
            }
        } else {
            $recentMatches = [];
        }

        return Inertia::render('classement', [
            'ligues' => $ligues,
            'saisons' => $saisons,
            'selectedLigueId' => $selectedLigueId,
            'selectedSaisonId' => $selectedSaisonId,
            'standings' => $standings,
            'recentMatches' => $recentMatches ?? [],
        ]);
    }

    public function statistiques()
    {
        $ligues = Ligue::orderBy('niveau')->get(['id','nom','niveau']);
        
        // Récupérer les IDs des phases finales des coupes avec poules pour les exclure
        $phaseFinaleIds = \App\Models\CoupeAvecPoule::whereNotNull('coupe_phase_finale_id')
            ->pluck('coupe_phase_finale_id')
            ->filter()
            ->unique()
            ->toArray();
        
        // Charger les coupes normales en excluant les phases finales
        $coupes = Coupe::with(['modele' => function($q) { $q->select('id', 'nom'); }])
            ->whereNotIn('id', $phaseFinaleIds)
            ->orderByDesc('created_at')
            ->get(['id','nom','created_at','coupe_modele_id']);
        
        // Charger les coupes avec poules
        $coupesAvecPoules = \App\Models\CoupeAvecPoule::with(['modele' => function($q) { $q->select('id', 'nom'); }])
            ->orderByDesc('created_at')
            ->get(['id','nom','created_at','coupe_avec_poule_modele_id']);
        
        // Combiner les deux listes en ajoutant un type pour les distinguer
        $allCoupes = collect();
        foreach ($coupes as $coupe) {
            $allCoupes->push((object) array_merge($coupe->toArray(), [
                'type' => 'coupe',
                'modele_type' => 'coupe',
                'modele_id' => $coupe->coupe_modele_id
            ]));
        }
        foreach ($coupesAvecPoules as $coupeAvecPoule) {
            $allCoupes->push((object) array_merge($coupeAvecPoule->toArray(), [
                'type' => 'coupe_avec_poule',
                'modele_type' => 'coupe_avec_poule',
                'modele_id' => $coupeAvecPoule->coupe_avec_poule_modele_id,
                'coupe_modele_id' => $coupeAvecPoule->coupe_avec_poule_modele_id,
                'modele' => $coupeAvecPoule->modele
            ]));
        }
        // Trier par date de création
        $allCoupes = $allCoupes->sortByDesc('created_at')->values();
        
        // Charger tous les modèles de coupes normales
        $coupeModeles = \App\Models\CoupeModele::select('id','nom')->orderBy('nom')->get();
        
        // Charger tous les modèles de coupes avec poules
        $coupeAvecPouleModeles = \App\Models\CoupeAvecPouleModele::select('id','nom')->orderBy('nom')->get();
        
        // Combiner les modèles avec un préfixe pour les distinguer
        $allModeles = collect();
        foreach ($coupeModeles as $modele) {
            $allModeles->push((object) [
                'id' => 'coupe_' . $modele->id,
                'nom' => $modele->nom,
                'type' => 'coupe',
                'original_id' => $modele->id
            ]);
        }
        foreach ($coupeAvecPouleModeles as $modele) {
            $allModeles->push((object) [
                'id' => 'coupe_avec_poule_' . $modele->id,
                'nom' => $modele->nom,
                'type' => 'coupe_avec_poule',
                'original_id' => $modele->id
            ]);
        }
        // Trier par nom
        $allModeles = $allModeles->sortBy('nom')->values();
        
        $mode = request('mode', 'ligue'); // ligue | tournois
        $selectedLigueId = (int)request('ligue_id', $ligues->first()->id ?? 0);
        $selectedCoupeId = (int)request('coupe_id', $allCoupes->first()->id ?? 0);
        $selectedModeleId = request('modele_id');
        $type = request('type', 'buteur'); // buteur | passeur | arret | clean_sheet | coup_franc | penalty | carton_jaune | carton_rouge

        $stats = [];
        $saisons = [];
        $selectedSaisonId = null;

        if ($mode === 'ligue') {
            $saisons = Saison::where('ligue_id', $selectedLigueId)
                ->orderByDesc('date_debut')
                ->get(['id','nom','date_debut','ligue_id']);
            $selectedSaisonId = (int)request('saison_id', $saisons->first()->id ?? 0);
            
            if ($selectedSaisonId) {
                $stats = $this->getLigueStats($selectedSaisonId, $type);
            }
        } else {
            // Mode tournois
            if ($selectedModeleId) {
                // Parser le modèle ID pour extraire le type et l'ID original
                $modeleType = null;
                $modeleOriginalId = null;
                
                if (str_starts_with($selectedModeleId, 'coupe_avec_poule_')) {
                    $modeleType = 'coupe_avec_poule';
                    $modeleOriginalId = (int)str_replace('coupe_avec_poule_', '', $selectedModeleId);
                } elseif (str_starts_with($selectedModeleId, 'coupe_')) {
                    $modeleType = 'coupe';
                    $modeleOriginalId = (int)str_replace('coupe_', '', $selectedModeleId);
                }
                
                // Filtrer les coupes par modèle
                if ($modeleType && $modeleOriginalId) {
                    $allCoupes = $allCoupes->filter(function($coupe) use ($modeleType, $modeleOriginalId) {
                        return isset($coupe->modele_type) && 
                               $coupe->modele_type === $modeleType && 
                               isset($coupe->modele_id) && 
                               $coupe->modele_id == $modeleOriginalId;
                    });
                }
                
                // Mettre à jour la coupe sélectionnée si elle n'est plus dans la liste filtrée
                if (!$allCoupes->contains('id', $selectedCoupeId)) {
                    $selectedCoupeId = $allCoupes->first()->id ?? 0;
                }
            }
            
            if ($selectedCoupeId) {
                $stats = $this->getCoupeStats($selectedCoupeId, $type);
            }
        }

        return Inertia::render('statistiques', [
            'ligues' => $ligues,
            'saisons' => $saisons,
            'coupes' => $allCoupes->toArray(),
            'coupeModeles' => $allModeles->toArray(),
            'selectedLigueId' => $selectedLigueId,
            'selectedSaisonId' => $selectedSaisonId,
            'selectedCoupeId' => $selectedCoupeId,
            'selectedModeleId' => $selectedModeleId,
            'type' => $type,
            'mode' => $mode,
            'stats' => $stats,
        ]);
    }

    public function equipes(Request $request)
    {
        // Charger toutes les ligues
        $ligues = Ligue::orderBy('niveau')->get(['id','nom','niveau']);
        
        // Recherche par nom d'équipe
        $search = $request->query('search', '');
        
        // Ligue sélectionnée (filtrer par onglet)
        $selectedLigueId = $request->query('ligue_id');
        
        // Charger les équipes avec leurs ligues (via les saisons)
        $equipesQuery = \App\Models\Equipe::query();
        
        // Si une ligue est sélectionnée, filtrer les équipes qui participent à cette ligue
        if ($selectedLigueId) {
            $equipesQuery->whereHas('saisons', function($q) use ($selectedLigueId) {
                $q->whereHas('ligue', function($q2) use ($selectedLigueId) {
                    $q2->where('id', $selectedLigueId);
                });
            });
        }
        
        // Recherche par nom
        if ($search) {
            $equipesQuery->where('nom', 'like', '%' . $search . '%');
        }
        
        $equipes = $equipesQuery->select('id', 'nom', 'logo', 'description', 'created_at')
            ->orderBy('nom')
            ->get();
        
        // Organiser les équipes par ligue pour les onglets
        $equipesParLigue = [];
        foreach ($ligues as $ligue) {
            $equipesParLigue[$ligue->id] = \App\Models\Equipe::whereHas('saisons', function($q) use ($ligue) {
                $q->whereHas('ligue', function($q2) use ($ligue) {
                    $q2->where('id', $ligue->id);
                });
            })
            ->select('id', 'nom', 'logo', 'description', 'created_at')
            ->orderBy('nom')
            ->get();
        }
        
        // Convertir les collections en tableaux pour Inertia
        $equipesParLigueArray = [];
        foreach ($equipesParLigue as $ligueId => $equipesLigue) {
            $equipesParLigueArray[$ligueId] = $equipesLigue->toArray();
        }

        return Inertia::render('equipes/index-public', [
            'ligues' => $ligues->toArray(),
            'equipes' => $equipes->toArray(),
            'equipesParLigue' => $equipesParLigueArray,
            'selectedLigueId' => $selectedLigueId ? (int)$selectedLigueId : null,
            'search' => $search,
        ]);
    }

    public function calendrier(Request $request)
    {
        $ligues = Ligue::orderBy('niveau')->get(['id','nom','niveau']);
        $selectedLigueId = (int)($request->query('ligue_id') ?: ($ligues->first()->id ?? 0));
        $saisons = Saison::where('ligue_id', $selectedLigueId)
            ->orderByDesc('date_debut')
            ->get(['id','nom','date_debut','ligue_id']);
        $selectedSaisonId = (int)($request->query('saison_id') ?: ($saisons->first()->id ?? 0));

        $next = null; $past = [];
        if ($selectedSaisonId) {
            $saison = Saison::with(['journees.matchs.homeEquipe','journees.matchs.awayEquipe'])
                ->find($selectedSaisonId);
            if ($saison) {
                // Trouver la prochaine journée: plus petit numero ayant au moins un match non terminé
                $candidates = [];
                foreach ($saison->journees as $j) {
                    $hasUnfinished = $j->matchs->contains(function($m){ return !$m->termine; });
                    if ($hasUnfinished) { $candidates[] = $j; }
                }
                if (!empty($candidates)) {
                    usort($candidates, fn($a,$b)=> ($a->numero ?? PHP_INT_MAX) <=> ($b->numero ?? PHP_INT_MAX));
                    $next = $candidates[0];
                }
                // Dernières journées: celles avant (ou toutes terminées), triées desc par numero
                $past = [];
                foreach ($saison->journees as $j) {
                    $allFinished = $j->matchs->every(function($m){ return $m->termine; });
                    if ($allFinished) { $past[] = $j; }
                }
                usort($past, fn($a,$b)=> (int)($b->numero ?? 0) <=> (int)($a->numero ?? 0));
            }
        }

        return Inertia::render('calendrier', [
            'ligues' => $ligues,
            'saisons' => $saisons,
            'selectedLigueId' => $selectedLigueId,
            'selectedSaisonId' => $selectedSaisonId,
            'nextJournee' => $next,
            'pastJournees' => $past,
        ]);
    }

    public function coupes(Request $request)
    {
        // Récupérer les IDs des phases finales des coupes avec poules pour les exclure
        $phaseFinaleIds = \App\Models\CoupeAvecPoule::whereNotNull('coupe_phase_finale_id')
            ->pluck('coupe_phase_finale_id')
            ->filter()
            ->unique()
            ->toArray();
        
        // Charger les coupes normales (sans logos) en excluant les phases finales
        $coupes = Coupe::with([
                'modele' => function($q) { $q->select('id', 'nom', 'description'); },
                'rounds.matchs.homeEquipe' => function($q) { $q->select('id', 'nom'); },
                'rounds.matchs.awayEquipe' => function($q) { $q->select('id', 'nom'); },
                'rounds.matchs.matchRetour.homeEquipe' => function($q) { $q->select('id', 'nom'); },
                'rounds.matchs.matchRetour.awayEquipe' => function($q) { $q->select('id', 'nom'); },
            ])
            ->whereNotIn('id', $phaseFinaleIds)
            ->orderByDesc('created_at')
            ->get();
        
        // Charger les coupes avec poules (sans logos)
        $coupesAvecPoules = \App\Models\CoupeAvecPoule::with([
                'modele' => function($q) { $q->select('id', 'nom', 'description'); },
                'poules.matchs.homeEquipe' => function($q) { $q->select('id', 'nom'); },
                'poules.matchs.awayEquipe' => function($q) { $q->select('id', 'nom'); },
                'poules.equipes' => function($q) { $q->select('equipes.id', 'equipes.nom'); },
            ])
            ->orderByDesc('created_at')
            ->get();
        
        // Combiner les deux listes en ajoutant un type pour les distinguer
        $allCoupes = collect();
        
        // Ajouter les coupes normales
        foreach ($coupes as $coupe) {
            $allCoupes->push((object) array_merge($coupe->toArray(), ['type' => 'coupe']));
        }
        
        // Ajouter les coupes avec poules avec leurs relations
        foreach ($coupesAvecPoules as $coupeAvecPoule) {
            $coupeAvecPoule->load([
                'poules.equipes',
                'poules.matchs.homeEquipe',
                'poules.matchs.awayEquipe',
                'coupePhaseFinale.rounds.matchs.homeEquipe',
                'coupePhaseFinale.rounds.matchs.awayEquipe',
                'coupePhaseFinale.rounds.matchs.matchRetour.homeEquipe',
                'coupePhaseFinale.rounds.matchs.matchRetour.awayEquipe',
            ]);
            $allCoupes->push((object) array_merge($coupeAvecPoule->toArray(), ['type' => 'coupe_avec_poule']));
        }
        
        // Trier par date de création
        $allCoupes = $allCoupes->sortByDesc('created_at')->values();
        
        $selectedCoupeId = (int)($request->query('coupe_id') ?: ($allCoupes->first()->id ?? 0));
        $selectedCoupe = $allCoupes->firstWhere('id', $selectedCoupeId);
        
        // Si c'est une coupe avec poules, calculer le classement global fusionné
        $selectedCoupeArray = $selectedCoupe ? json_decode(json_encode($selectedCoupe), true) : null;
        if ($selectedCoupe && isset($selectedCoupe->type) && $selectedCoupe->type === 'coupe_avec_poule') {
            $selectedCoupe = $this->calculerClassementGlobalCoupeAvecPoule($selectedCoupe);
            $selectedCoupeArray = json_decode(json_encode($selectedCoupe), true);
            // Convertir classementGlobal en tableau
            if (isset($selectedCoupe->classementGlobal)) {
                $selectedCoupeArray['classementGlobal'] = array_values($selectedCoupe->classementGlobal);
            }
            
            // Charger et ajouter les rounds de la phase finale si elle existe
            $phaseFinaleId = isset($selectedCoupeArray['coupe_phase_finale_id']) ? $selectedCoupeArray['coupe_phase_finale_id'] : null;
            if (!$phaseFinaleId && isset($selectedCoupe->coupe_phase_finale_id)) {
                $phaseFinaleId = $selectedCoupe->coupe_phase_finale_id;
            }
            
            if ($phaseFinaleId) {
                // Charger la phase finale avec toutes ses relations
                $phaseFinale = \App\Models\Coupe::with([
                    'rounds.matchs.homeEquipe' => function($q) { $q->select('equipes.id', 'equipes.nom', 'equipes.logo'); },
                    'rounds.matchs.awayEquipe' => function($q) { $q->select('equipes.id', 'equipes.nom', 'equipes.logo'); },
                    'rounds.matchs.matchRetour.homeEquipe' => function($q) { $q->select('equipes.id', 'equipes.nom', 'equipes.logo'); },
                    'rounds.matchs.matchRetour.awayEquipe' => function($q) { $q->select('equipes.id', 'equipes.nom', 'equipes.logo'); },
                ])->find($phaseFinaleId);
                
                if ($phaseFinale && $phaseFinale->rounds && $phaseFinale->rounds->count() > 0) {
                    $selectedCoupeArray['rounds'] = json_decode(json_encode($phaseFinale->rounds), true);
                }
            }
        }

        return Inertia::render('coupes', [
            'coupes' => $allCoupes->toArray(),
            'selectedCoupeId' => $selectedCoupeId,
            'selectedCoupe' => $selectedCoupeArray,
        ]);
    }

    private function getLigueStats($saisonId, $type)
    {
        $stats = [];
        $saison = Saison::with(['journees.matchs' => function($q){ $q->where('termine', true); }])->find($saisonId);
        
        if (!$saison) return $stats;

        if ($type === 'buteur' || $type === 'passeur') {
            $butQuery = But::query()
                ->whereHas('match', function($q) use ($saisonId) {
                    $q->whereHas('journee', function($q2) use ($saisonId){ $q2->where('saison_id', $saisonId); })
                      ->where('termine', true);
                });
            if ($type === 'buteur') {
                $agg = $butQuery->selectRaw('buteur_id as joueur_id, COUNT(*) as total')
                    ->groupBy('buteur_id')->orderByDesc('total')->limit(200)->get();
                $joueurs = Joueur::whereIn('id', $agg->pluck('joueur_id'))->get(['id','nom']);
                $idToName = $joueurs->pluck('nom', 'id');
                foreach ($agg as $row) { 
                    $stats[] = ['joueur_id'=>$row->joueur_id, 'nom'=>$idToName[$row->joueur_id] ?? ('#'.$row->joueur_id), 'val'=>$row->total]; 
                }
            } else { // passeur
                $agg = $butQuery->whereNotNull('passeur_id')
                    ->selectRaw('passeur_id as joueur_id, COUNT(*) as total')
                    ->groupBy('passeur_id')->orderByDesc('total')->limit(200)->get();
                $joueurs = Joueur::whereIn('id', $agg->pluck('joueur_id'))->get(['id','nom']);
                $idToName = $joueurs->pluck('nom', 'id');
                foreach ($agg as $row) { 
                    $stats[] = ['joueur_id'=>$row->joueur_id, 'nom'=>$idToName[$row->joueur_id] ?? ('#'.$row->joueur_id), 'val'=>$row->total]; 
                }
            }
        } elseif ($type === 'arret' || $type === 'clean_sheet') {
            $keeperStats = [];
            foreach ($saison->journees as $j) {
                foreach ($j->matchs as $m) {
                    if ($m->gardien_home_id) {
                        $keeperStats[$m->gardien_home_id]['arret'] = ($keeperStats[$m->gardien_home_id]['arret'] ?? 0) + (int)$m->arrets_home;
                    }
                    if ($m->gardien_away_id) {
                        $keeperStats[$m->gardien_away_id]['arret'] = ($keeperStats[$m->gardien_away_id]['arret'] ?? 0) + (int)$m->arrets_away;
                    }
                    if ($m->gardien_home_id && (int)$m->score_away === 0) {
                        $keeperStats[$m->gardien_home_id]['clean_sheet'] = ($keeperStats[$m->gardien_home_id]['clean_sheet'] ?? 0) + 1;
                    }
                    if ($m->gardien_away_id && (int)$m->score_home === 0) {
                        $keeperStats[$m->gardien_away_id]['clean_sheet'] = ($keeperStats[$m->gardien_away_id]['clean_sheet'] ?? 0) + 1;
                    }
                }
            }
            if (!empty($keeperStats)) {
                $ids = array_keys($keeperStats);
                $names = Joueur::whereIn('id', $ids)->pluck('nom','id');
                foreach ($keeperStats as $id => $vals) {
                    $stats[] = [
                        'joueur_id' => $id,
                        'nom' => $names[$id] ?? ('#'.$id),
                        'val' => (int)($vals[$type] ?? 0),
                    ];
                }
                usort($stats, fn($a,$b)=> $b['val'] <=> $a['val']);
            }
        } elseif ($type === 'coup_franc' || $type === 'penalty') {
            // Statistiques des types de buts
            $butQuery = But::query()
                ->whereHas('match', function($q) use ($saisonId) {
                    $q->whereHas('journee', function($q2) use ($saisonId){ $q2->where('saison_id', $saisonId); })
                      ->where('termine', true);
                })
                ->where('type', $type);
            
            $agg = $butQuery->selectRaw('buteur_id as joueur_id, COUNT(*) as total')
                ->groupBy('buteur_id')->orderByDesc('total')->limit(200)->get();
            $joueurs = Joueur::whereIn('id', $agg->pluck('joueur_id'))->get(['id','nom']);
            $idToName = $joueurs->pluck('nom', 'id');
            foreach ($agg as $row) { 
                $stats[] = ['joueur_id'=>$row->joueur_id, 'nom'=>$idToName[$row->joueur_id] ?? ('#'.$row->joueur_id), 'val'=>$row->total]; 
            }
        } elseif ($type === 'carton_jaune' || $type === 'carton_rouge') {
            // Statistiques des cartons
            $cartonQuery = \App\Models\Carton::query()
                ->whereHas('match', function($q) use ($saisonId) {
                    $q->whereHas('journee', function($q2) use ($saisonId){ $q2->where('saison_id', $saisonId); })
                      ->where('termine', true);
                })
                ->where('type', $type === 'carton_jaune' ? 'jaune' : 'rouge');
            
            $agg = $cartonQuery->selectRaw('joueur_id, COUNT(*) as total')
                ->groupBy('joueur_id')->orderByDesc('total')->limit(200)->get();
            $joueurs = Joueur::whereIn('id', $agg->pluck('joueur_id'))->get(['id','nom']);
            $idToName = $joueurs->pluck('nom', 'id');
            foreach ($agg as $row) { 
                $stats[] = ['joueur_id'=>$row->joueur_id, 'nom'=>$idToName[$row->joueur_id] ?? ('#'.$row->joueur_id), 'val'=>$row->total]; 
            }
        }
        
        return $stats;
    }

    private function getCoupeStats($coupeId, $type)
    {
        $stats = [];
        
        // Vérifier si c'est une coupe avec poules
        $coupeAvecPoule = \App\Models\CoupeAvecPoule::with('coupePhaseFinale.rounds.matchs')->find($coupeId);
        
        if ($type === 'buteur' || $type === 'passeur') {
            // Statistiques des coupes normales
            $coupeButs = \App\Models\CoupeBut::whereHas('match', function($q) use ($coupeId) {
                $q->whereHas('round', function($q2) use ($coupeId){ $q2->where('coupe_id', $coupeId); })
                  ->where('termine', true);
            })->get();
            
            // Statistiques des coupes avec poules (groupes + phase finale)
            $pouleButs = \App\Models\PouleBut::whereHas('pouleMatch', function($q) use ($coupeId) {
                $q->whereHas('poule', function($q2) use ($coupeId){ $q2->where('coupe_avec_poule_id', $coupeId); })
                  ->where('termine', true);
            })->get();
            
            // Ajouter les buts de la phase finale si elle existe
            $phaseFinaleButs = collect();
            if ($coupeAvecPoule && $coupeAvecPoule->coupePhaseFinale) {
                $phaseFinaleButs = \App\Models\CoupeBut::whereHas('match', function($q) use ($coupeAvecPoule) {
                    $q->whereHas('round', function($q2) use ($coupeAvecPoule) {
                        $q2->where('coupe_id', $coupeAvecPoule->coupePhaseFinale->id);
                    })->where('termine', true);
                })->get();
            }
            
            // Combiner toutes les statistiques
            $allButs = $coupeButs->concat($pouleButs)->concat($phaseFinaleButs);
            
            if ($type === 'buteur') {
                $butCounts = $allButs->groupBy('buteur_id')->map(function($buts) {
                    return $buts->count();
                })->sortDesc()->take(200);
                
                $joueurs = Joueur::whereIn('id', $butCounts->keys())->get(['id','nom']);
                $idToName = $joueurs->pluck('nom', 'id');
                
                foreach ($butCounts as $joueurId => $count) {
                    $stats[] = ['joueur_id'=>$joueurId, 'nom'=>$idToName[$joueurId] ?? ('#'.$joueurId), 'val'=>$count]; 
                }
            } else { // passeur
                $passeCounts = $allButs->whereNotNull('passeur_id')->groupBy('passeur_id')->map(function($buts) {
                    return $buts->count();
                })->sortDesc()->take(200);
                
                $joueurs = Joueur::whereIn('id', $passeCounts->keys())->get(['id','nom']);
                $idToName = $joueurs->pluck('nom', 'id');
                
                foreach ($passeCounts as $joueurId => $count) {
                    $stats[] = ['joueur_id'=>$joueurId, 'nom'=>$idToName[$joueurId] ?? ('#'.$joueurId), 'val'=>$count]; 
                }
            }
        } elseif ($type === 'arret' || $type === 'clean_sheet') {
            $keeperStats = [];
            
            // Matchs des coupes normales
            $coupeMatches = \App\Models\CoupeMatch::whereHas('round', function($q) use ($coupeId) {
                $q->where('coupe_id', $coupeId);
            })->where('termine', true)->get();
            
            foreach ($coupeMatches as $m) {
                if ($m->gardien_home_id) {
                    $keeperStats[$m->gardien_home_id]['arret'] = ($keeperStats[$m->gardien_home_id]['arret'] ?? 0) + (int)$m->arrets_home;
                }
                if ($m->gardien_away_id) {
                    $keeperStats[$m->gardien_away_id]['arret'] = ($keeperStats[$m->gardien_away_id]['arret'] ?? 0) + (int)$m->arrets_away;
                }
                if ($m->gardien_home_id && (int)$m->score_away === 0) {
                    $keeperStats[$m->gardien_home_id]['clean_sheet'] = ($keeperStats[$m->gardien_home_id]['clean_sheet'] ?? 0) + 1;
                }
                if ($m->gardien_away_id && (int)$m->score_home === 0) {
                    $keeperStats[$m->gardien_away_id]['clean_sheet'] = ($keeperStats[$m->gardien_away_id]['clean_sheet'] ?? 0) + 1;
                }
            }
            
            // Matchs des coupes avec poules (groupes + phase finale)
            $pouleMatches = \App\Models\PouleMatch::whereHas('poule', function($q) use ($coupeId) {
                $q->where('coupe_avec_poule_id', $coupeId);
            })->where('termine', true)->get();
            
            foreach ($pouleMatches as $m) {
                if ($m->gardien_home_id) {
                    $keeperStats[$m->gardien_home_id]['arret'] = ($keeperStats[$m->gardien_home_id]['arret'] ?? 0) + (int)$m->arrets_home;
                }
                if ($m->gardien_away_id) {
                    $keeperStats[$m->gardien_away_id]['arret'] = ($keeperStats[$m->gardien_away_id]['arret'] ?? 0) + (int)$m->arrets_away;
                }
                if ($m->gardien_home_id && (int)$m->score_away === 0) {
                    $keeperStats[$m->gardien_home_id]['clean_sheet'] = ($keeperStats[$m->gardien_home_id]['clean_sheet'] ?? 0) + 1;
                }
                if ($m->gardien_away_id && (int)$m->score_home === 0) {
                    $keeperStats[$m->gardien_away_id]['clean_sheet'] = ($keeperStats[$m->gardien_away_id]['clean_sheet'] ?? 0) + 1;
                }
            }
            
            // Ajouter les matchs de la phase finale si elle existe
            if ($coupeAvecPoule && $coupeAvecPoule->coupePhaseFinale) {
                $phaseFinaleMatches = \App\Models\CoupeMatch::whereHas('round', function($q) use ($coupeAvecPoule) {
                    $q->where('coupe_id', $coupeAvecPoule->coupePhaseFinale->id);
                })->where('termine', true)->get();
                
                foreach ($phaseFinaleMatches as $m) {
                    if ($m->gardien_home_id) {
                        $keeperStats[$m->gardien_home_id]['arret'] = ($keeperStats[$m->gardien_home_id]['arret'] ?? 0) + (int)$m->arrets_home;
                    }
                    if ($m->gardien_away_id) {
                        $keeperStats[$m->gardien_away_id]['arret'] = ($keeperStats[$m->gardien_away_id]['arret'] ?? 0) + (int)$m->arrets_away;
                    }
                    if ($m->gardien_home_id && (int)$m->score_away === 0) {
                        $keeperStats[$m->gardien_home_id]['clean_sheet'] = ($keeperStats[$m->gardien_home_id]['clean_sheet'] ?? 0) + 1;
                    }
                    if ($m->gardien_away_id && (int)$m->score_home === 0) {
                        $keeperStats[$m->gardien_away_id]['clean_sheet'] = ($keeperStats[$m->gardien_away_id]['clean_sheet'] ?? 0) + 1;
                    }
                }
            }
            
            if (!empty($keeperStats)) {
                $ids = array_keys($keeperStats);
                $names = Joueur::whereIn('id', $ids)->pluck('nom','id');
                foreach ($keeperStats as $id => $vals) {
                    $stats[] = [
                        'joueur_id' => $id,
                        'nom' => $names[$id] ?? ('#'.$id),
                        'val' => (int)($vals[$type] ?? 0),
                    ];
                }
                usort($stats, fn($a,$b)=> $b['val'] <=> $a['val']);
            }
        } elseif ($type === 'coup_franc' || $type === 'penalty') {
            // Statistiques des types de buts pour les coupes
            $coupeButs = \App\Models\CoupeBut::whereHas('match', function($q) use ($coupeId) {
                $q->whereHas('round', function($q2) use ($coupeId){ $q2->where('coupe_id', $coupeId); })
                  ->where('termine', true);
            })->where('type', $type)->get();
            
            // Coupes avec poules (groupes + phase finale)
            $pouleButs = \App\Models\PouleBut::whereHas('pouleMatch', function($q) use ($coupeId) {
                $q->whereHas('poule', function($q2) use ($coupeId){ $q2->where('coupe_avec_poule_id', $coupeId); })
                  ->where('termine', true);
            })->where('type', $type)->get();
            
            // Ajouter les buts de la phase finale si elle existe
            $phaseFinaleButs = collect();
            if ($coupeAvecPoule && $coupeAvecPoule->coupePhaseFinale) {
                $phaseFinaleButs = \App\Models\CoupeBut::whereHas('match', function($q) use ($coupeAvecPoule) {
                    $q->whereHas('round', function($q2) use ($coupeAvecPoule) {
                        $q2->where('coupe_id', $coupeAvecPoule->coupePhaseFinale->id);
                    })->where('termine', true);
                })->where('type', $type)->get();
            }
            
            // Combiner toutes les statistiques
            $allButs = $coupeButs->concat($pouleButs)->concat($phaseFinaleButs);
            
            $butCounts = $allButs->groupBy('buteur_id')->map(function($buts) {
                return $buts->count();
            })->sortDesc()->take(200);
            
            $joueurs = Joueur::whereIn('id', $butCounts->keys())->get(['id','nom']);
            $idToName = $joueurs->pluck('nom', 'id');
            
            foreach ($butCounts as $joueurId => $count) {
                $stats[] = ['joueur_id'=>$joueurId, 'nom'=>$idToName[$joueurId] ?? ('#'.$joueurId), 'val'=>$count]; 
            }
        } elseif ($type === 'carton_jaune' || $type === 'carton_rouge') {
            // Statistiques des cartons pour les coupes
            $coupeCartons = \App\Models\CoupeCarton::whereHas('match', function($q) use ($coupeId) {
                $q->whereHas('round', function($q2) use ($coupeId){ $q2->where('coupe_id', $coupeId); })
                  ->where('termine', true);
            })->where('type', $type === 'carton_jaune' ? 'jaune' : 'rouge')->get();
            
            // Coupes avec poules (groupes + phase finale)
            $pouleCartons = \App\Models\PouleCarton::whereHas('pouleMatch', function($q) use ($coupeId) {
                $q->whereHas('poule', function($q2) use ($coupeId){ $q2->where('coupe_avec_poule_id', $coupeId); })
                  ->where('termine', true);
            })->where('type', $type === 'carton_jaune' ? 'jaune' : 'rouge')->get();
            
            // Ajouter les cartons de la phase finale si elle existe
            $phaseFinaleCartons = collect();
            if ($coupeAvecPoule && $coupeAvecPoule->coupePhaseFinale) {
                $phaseFinaleCartons = \App\Models\CoupeCarton::whereHas('match', function($q) use ($coupeAvecPoule) {
                    $q->whereHas('round', function($q2) use ($coupeAvecPoule) {
                        $q2->where('coupe_id', $coupeAvecPoule->coupePhaseFinale->id);
                    })->where('termine', true);
                })->where('type', $type === 'carton_jaune' ? 'jaune' : 'rouge')->get();
            }
            
            // Combiner toutes les statistiques
            $allCartons = $coupeCartons->concat($pouleCartons)->concat($phaseFinaleCartons);
            
            $cartonCounts = $allCartons->groupBy('joueur_id')->map(function($cartons) {
                return $cartons->count();
            })->sortDesc()->take(200);
            
            $joueurs = Joueur::whereIn('id', $cartonCounts->keys())->get(['id','nom']);
            $idToName = $joueurs->pluck('nom', 'id');
            
            foreach ($cartonCounts as $joueurId => $count) {
                $stats[] = ['joueur_id'=>$joueurId, 'nom'=>$idToName[$joueurId] ?? ('#'.$joueurId), 'val'=>$count]; 
            }
        }
        
        return $stats;
    }

    public function joueur(Joueur $joueur)
    {
        $joueur->load([
            'equipe',
            'poste',
            'postesSecondaires',
            'transferts.ancienneEquipe',
            'transferts.nouvelleEquipe'
        ]);

        // Calculer les statistiques du joueur dans les compétitions actuelles
        $stats = $this->calculerStatsJoueur($joueur);

        return Inertia::render('joueurs/show', compact('joueur', 'stats'));
    }

    private function calculerStatsJoueur(Joueur $joueur)
    {
        $stats = [
            'buts' => 0,
            'passes_decisives' => 0,
            'cartons_jaunes' => 0,
            'cartons_rouges' => 0,
            'matchs_gardien' => 0,
            'arrets' => 0,
            'clean_sheets' => 0,
            'competitions' => [],
        ];

        // Récupérer les saisons en cours (non terminées)
        $saisonsEnCours = Saison::where('status', '!=', 'terminé')
            ->with(['ligue', 'journees.matchs'])
            ->get();

        foreach ($saisonsEnCours as $saison) {
            $statsCompetition = [
                'type' => 'saison',
                'nom' => $saison->nom,
                'ligue' => $saison->ligue->nom ?? null,
                'buts' => 0,
                'passes_decisives' => 0,
                'cartons_jaunes' => 0,
                'cartons_rouges' => 0,
                'matchs_gardien' => 0,
                'arrets' => 0,
                'clean_sheets' => 0,
            ];

            // Buts et passes décisives dans les matchs de ligue
            foreach ($saison->journees as $journee) {
                foreach ($journee->matchs as $match) {
                    if (!$match->termine) continue;

                    // Buts marqués
                    $buts = But::where('match_id', $match->id)
                        ->where('buteur_id', $joueur->id)
                        ->count();
                    $statsCompetition['buts'] += $buts;
                    $stats['buts'] += $buts;

                    // Passes décisives
                    $passes = But::where('match_id', $match->id)
                        ->where('passeur_id', $joueur->id)
                        ->count();
                    $statsCompetition['passes_decisives'] += $passes;
                    $stats['passes_decisives'] += $passes;

                    // Cartons
                    $cartons = \App\Models\Carton::where('match_id', $match->id)
                        ->where('joueur_id', $joueur->id)
                        ->get();
                    foreach ($cartons as $carton) {
                        if ($carton->type === 'jaune') {
                            $statsCompetition['cartons_jaunes']++;
                            $stats['cartons_jaunes']++;
                        } elseif ($carton->type === 'rouge') {
                            $statsCompetition['cartons_rouges']++;
                            $stats['cartons_rouges']++;
                        }
                    }

                    // Gardien
                    if ($match->gardien_home_id === $joueur->id || $match->gardien_away_id === $joueur->id) {
                        $statsCompetition['matchs_gardien']++;
                        $stats['matchs_gardien']++;

                        if ($match->gardien_home_id === $joueur->id) {
                            $statsCompetition['arrets'] += (int)$match->arrets_home;
                            $stats['arrets'] += (int)$match->arrets_home;
                            if ((int)$match->score_away === 0) {
                                $statsCompetition['clean_sheets']++;
                                $stats['clean_sheets']++;
                            }
                        } elseif ($match->gardien_away_id === $joueur->id) {
                            $statsCompetition['arrets'] += (int)$match->arrets_away;
                            $stats['arrets'] += (int)$match->arrets_away;
                            if ((int)$match->score_home === 0) {
                                $statsCompetition['clean_sheets']++;
                                $stats['clean_sheets']++;
                            }
                        }
                    }
                }
            }

            if ($statsCompetition['buts'] > 0 || $statsCompetition['passes_decisives'] > 0 || 
                $statsCompetition['cartons_jaunes'] > 0 || $statsCompetition['cartons_rouges'] > 0 ||
                $statsCompetition['matchs_gardien'] > 0) {
                $stats['competitions'][] = $statsCompetition;
            }
        }

        // Récupérer les coupes avec des matchs non terminés
        $coupes = Coupe::with(['rounds.matchs'])->get();
        foreach ($coupes as $coupe) {
            $hasNonTerminated = false;
            foreach ($coupe->rounds as $round) {
                foreach ($round->matchs as $match) {
                    if (!$match->termine) {
                        $hasNonTerminated = true;
                        break 2;
                    }
                }
            }

            if (!$hasNonTerminated) continue;

            $statsCompetition = [
                'type' => 'coupe',
                'nom' => $coupe->nom,
                'ligue' => null,
                'buts' => 0,
                'passes_decisives' => 0,
                'cartons_jaunes' => 0,
                'cartons_rouges' => 0,
                'matchs_gardien' => 0,
                'arrets' => 0,
                'clean_sheets' => 0,
            ];

            foreach ($coupe->rounds as $round) {
                foreach ($round->matchs as $match) {
                    if (!$match->termine) continue;

                    // Buts marqués
                    $buts = \App\Models\CoupeBut::where('coupe_match_id', $match->id)
                        ->where('buteur_id', $joueur->id)
                        ->count();
                    $statsCompetition['buts'] += $buts;
                    $stats['buts'] += $buts;

                    // Passes décisives
                    $passes = \App\Models\CoupeBut::where('coupe_match_id', $match->id)
                        ->where('passeur_id', $joueur->id)
                        ->count();
                    $statsCompetition['passes_decisives'] += $passes;
                    $stats['passes_decisives'] += $passes;

                    // Cartons
                    $cartons = \App\Models\CoupeCarton::where('coupe_match_id', $match->id)
                        ->where('joueur_id', $joueur->id)
                        ->get();
                    foreach ($cartons as $carton) {
                        if ($carton->type === 'jaune') {
                            $statsCompetition['cartons_jaunes']++;
                            $stats['cartons_jaunes']++;
                        } elseif ($carton->type === 'rouge') {
                            $statsCompetition['cartons_rouges']++;
                            $stats['cartons_rouges']++;
                        }
                    }

                    // Gardien
                    if ($match->gardien_home_id === $joueur->id || $match->gardien_away_id === $joueur->id) {
                        $statsCompetition['matchs_gardien']++;
                        $stats['matchs_gardien']++;

                        if ($match->gardien_home_id === $joueur->id) {
                            $statsCompetition['arrets'] += (int)$match->arrets_home;
                            $stats['arrets'] += (int)$match->arrets_home;
                            if ((int)$match->score_away === 0) {
                                $statsCompetition['clean_sheets']++;
                                $stats['clean_sheets']++;
                            }
                        } elseif ($match->gardien_away_id === $joueur->id) {
                            $statsCompetition['arrets'] += (int)$match->arrets_away;
                            $stats['arrets'] += (int)$match->arrets_away;
                            if ((int)$match->score_home === 0) {
                                $statsCompetition['clean_sheets']++;
                                $stats['clean_sheets']++;
                            }
                        }
                    }
                }
            }

            if ($statsCompetition['buts'] > 0 || $statsCompetition['passes_decisives'] > 0 || 
                $statsCompetition['cartons_jaunes'] > 0 || $statsCompetition['cartons_rouges'] > 0 ||
                $statsCompetition['matchs_gardien'] > 0) {
                $stats['competitions'][] = $statsCompetition;
            }
        }

        // Coupes avec poules
        $coupesAvecPoules = \App\Models\CoupeAvecPoule::with(['poules.matchs', 'coupePhaseFinale.rounds.matchs'])->get();
        foreach ($coupesAvecPoules as $coupeAvecPoule) {
            // Vérifier si des matchs non terminés existent (poules ou phase finale)
            $hasNonTerminated = false;
            foreach ($coupeAvecPoule->poules as $poule) {
                foreach ($poule->matchs as $match) {
                    if (!$match->termine) {
                        $hasNonTerminated = true;
                        break 2;
                    }
                }
            }
            
            // Vérifier aussi la phase finale
            if (!$hasNonTerminated && $coupeAvecPoule->coupePhaseFinale) {
                foreach ($coupeAvecPoule->coupePhaseFinale->rounds as $round) {
                    foreach ($round->matchs as $match) {
                        if (!$match->termine) {
                            $hasNonTerminated = true;
                            break 2;
                        }
                    }
                }
            }

            if (!$hasNonTerminated) continue;

            $statsCompetition = [
                'type' => 'coupe_avec_poule',
                'nom' => $coupeAvecPoule->nom,
                'ligue' => null,
                'buts' => 0,
                'passes_decisives' => 0,
                'cartons_jaunes' => 0,
                'cartons_rouges' => 0,
                'matchs_gardien' => 0,
                'arrets' => 0,
                'clean_sheets' => 0,
            ];

            // Matchs de poules
            foreach ($coupeAvecPoule->poules as $poule) {
                foreach ($poule->matchs as $match) {
                    if (!$match->termine) continue;

                    // Buts marqués
                    $buts = \App\Models\PouleBut::where('poule_match_id', $match->id)
                        ->where('buteur_id', $joueur->id)
                        ->count();
                    $statsCompetition['buts'] += $buts;
                    $stats['buts'] += $buts;

                    // Passes décisives
                    $passes = \App\Models\PouleBut::where('poule_match_id', $match->id)
                        ->where('passeur_id', $joueur->id)
                        ->count();
                    $statsCompetition['passes_decisives'] += $passes;
                    $stats['passes_decisives'] += $passes;

                    // Cartons
                    $cartons = \App\Models\PouleCarton::where('poule_match_id', $match->id)
                        ->where('joueur_id', $joueur->id)
                        ->get();
                    foreach ($cartons as $carton) {
                        if ($carton->type === 'jaune') {
                            $statsCompetition['cartons_jaunes']++;
                            $stats['cartons_jaunes']++;
                        } elseif ($carton->type === 'rouge') {
                            $statsCompetition['cartons_rouges']++;
                            $stats['cartons_rouges']++;
                        }
                    }

                    // Gardien
                    if ($match->gardien_home_id === $joueur->id || $match->gardien_away_id === $joueur->id) {
                        $statsCompetition['matchs_gardien']++;
                        $stats['matchs_gardien']++;

                        if ($match->gardien_home_id === $joueur->id) {
                            $statsCompetition['arrets'] += (int)$match->arrets_home;
                            $stats['arrets'] += (int)$match->arrets_home;
                            if ((int)$match->score_away === 0) {
                                $statsCompetition['clean_sheets']++;
                                $stats['clean_sheets']++;
                            }
                        } elseif ($match->gardien_away_id === $joueur->id) {
                            $statsCompetition['arrets'] += (int)$match->arrets_away;
                            $stats['arrets'] += (int)$match->arrets_away;
                            if ((int)$match->score_home === 0) {
                                $statsCompetition['clean_sheets']++;
                                $stats['clean_sheets']++;
                            }
                        }
                    }
                }
            }

            // Phase finale (si elle existe)
            if ($coupeAvecPoule->coupePhaseFinale) {
                $coupePhaseFinale = $coupeAvecPoule->coupePhaseFinale;
                foreach ($coupePhaseFinale->rounds as $round) {
                    foreach ($round->matchs as $match) {
                        if (!$match->termine) continue;

                        // Buts marqués
                        $buts = \App\Models\CoupeBut::where('coupe_match_id', $match->id)
                            ->where('buteur_id', $joueur->id)
                            ->count();
                        $statsCompetition['buts'] += $buts;
                        $stats['buts'] += $buts;

                        // Passes décisives
                        $passes = \App\Models\CoupeBut::where('coupe_match_id', $match->id)
                            ->where('passeur_id', $joueur->id)
                            ->count();
                        $statsCompetition['passes_decisives'] += $passes;
                        $stats['passes_decisives'] += $passes;

                        // Cartons
                        $cartons = \App\Models\CoupeCarton::where('coupe_match_id', $match->id)
                            ->where('joueur_id', $joueur->id)
                            ->get();
                        foreach ($cartons as $carton) {
                            if ($carton->type === 'jaune') {
                                $statsCompetition['cartons_jaunes']++;
                                $stats['cartons_jaunes']++;
                            } elseif ($carton->type === 'rouge') {
                                $statsCompetition['cartons_rouges']++;
                                $stats['cartons_rouges']++;
                            }
                        }

                        // Gardien
                        if ($match->gardien_home_id === $joueur->id || $match->gardien_away_id === $joueur->id) {
                            $statsCompetition['matchs_gardien']++;
                            $stats['matchs_gardien']++;

                            if ($match->gardien_home_id === $joueur->id) {
                                $statsCompetition['arrets'] += (int)$match->arrets_home;
                                $stats['arrets'] += (int)$match->arrets_home;
                                if ((int)$match->score_away === 0) {
                                    $statsCompetition['clean_sheets']++;
                                    $stats['clean_sheets']++;
                                }
                            } elseif ($match->gardien_away_id === $joueur->id) {
                                $statsCompetition['arrets'] += (int)$match->arrets_away;
                                $stats['arrets'] += (int)$match->arrets_away;
                                if ((int)$match->score_home === 0) {
                                    $statsCompetition['clean_sheets']++;
                                    $stats['clean_sheets']++;
                                }
                            }
                        }
                    }
                }
            }

            if ($statsCompetition['buts'] > 0 || $statsCompetition['passes_decisives'] > 0 || 
                $statsCompetition['cartons_jaunes'] > 0 || $statsCompetition['cartons_rouges'] > 0 ||
                $statsCompetition['matchs_gardien'] > 0) {
                $stats['competitions'][] = $statsCompetition;
            }
        }

        return $stats;
    }

    private function calculerClassementGlobalCoupeAvecPoule($coupeAvecPoule)
    {
        $standings = [];
        
        // Collecter toutes les équipes qui participent aux poules
        if (isset($coupeAvecPoule->poules)) {
            foreach ($coupeAvecPoule->poules as $poule) {
                if (isset($poule->equipes)) {
                    foreach ($poule->equipes as $equipe) {
                        if (!isset($standings[$equipe->id])) {
                            $standings[$equipe->id] = [
                                'equipe_id' => $equipe->id,
                                'nom' => $equipe->nom,
                                'logo' => $equipe->logo ?? null,
                                'joue' => 0,
                                'gagne' => 0,
                                'nul' => 0,
                                'perdu' => 0,
                                'bp' => 0,
                                'bc' => 0,
                                'diff' => 0,
                                'points' => 0,
                            ];
                        }
                    }
                }
            }
        }
        
        // Calculer les statistiques à partir des matchs de poules
        if (isset($coupeAvecPoule->poules)) {
            foreach ($coupeAvecPoule->poules as $poule) {
                if (isset($poule->matchs)) {
                    foreach ($poule->matchs as $match) {
                        if (!isset($match->termine) || !$match->termine) continue;
                        
                        $homeId = $match->equipe_home_id ?? null;
                        $awayId = $match->equipe_away_id ?? null;
                        
                        if (!$homeId || !$awayId || !isset($standings[$homeId]) || !isset($standings[$awayId])) continue;
                        
                        $sh = (int)($match->score_home ?? 0);
                        $sa = (int)($match->score_away ?? 0);
                        
                        $standings[$homeId]['joue']++;
                        $standings[$awayId]['joue']++;
                        $standings[$homeId]['bp'] += $sh;
                        $standings[$homeId]['bc'] += $sa;
                        $standings[$awayId]['bp'] += $sa;
                        $standings[$awayId]['bc'] += $sh;
                        $standings[$homeId]['diff'] = $standings[$homeId]['bp'] - $standings[$homeId]['bc'];
                        $standings[$awayId]['diff'] = $standings[$awayId]['bp'] - $standings[$awayId]['bc'];
                        
                        if ($sh > $sa) {
                            $standings[$homeId]['gagne']++;
                            $standings[$homeId]['points'] += 3;
                            $standings[$awayId]['perdu']++;
                        } elseif ($sh < $sa) {
                            $standings[$awayId]['gagne']++;
                            $standings[$awayId]['points'] += 3;
                            $standings[$homeId]['perdu']++;
                        } else {
                            $standings[$homeId]['nul']++;
                            $standings[$awayId]['nul']++;
                            $standings[$homeId]['points'] += 1;
                            $standings[$awayId]['points'] += 1;
                        }
                    }
                }
            }
        }
        
        // Ajouter les statistiques de la phase finale si elle existe
        if (isset($coupeAvecPoule->coupePhaseFinale) && isset($coupeAvecPoule->coupePhaseFinale->rounds)) {
            foreach ($coupeAvecPoule->coupePhaseFinale->rounds as $round) {
                if (isset($round->matchs)) {
                    foreach ($round->matchs as $match) {
                        if (!isset($match->termine) || !$match->termine) continue;
                        
                        $homeId = $match->equipe_home_id ?? null;
                        $awayId = $match->equipe_away_id ?? null;
                        
                        if (!$homeId || !$awayId) continue;
                        
                        // Ajouter les équipes si elles ne sont pas déjà dans le classement
                        if (!isset($standings[$homeId])) {
                            $standings[$homeId] = [
                                'equipe_id' => $homeId,
                                'nom' => isset($match->homeEquipe) ? $match->homeEquipe->nom : "Équipe {$homeId}",
                                'logo' => isset($match->homeEquipe) ? ($match->homeEquipe->logo ?? null) : null,
                                'joue' => 0,
                                'gagne' => 0,
                                'nul' => 0,
                                'perdu' => 0,
                                'bp' => 0,
                                'bc' => 0,
                                'diff' => 0,
                                'points' => 0,
                            ];
                        }
                        if (!isset($standings[$awayId])) {
                            $standings[$awayId] = [
                                'equipe_id' => $awayId,
                                'nom' => isset($match->awayEquipe) ? $match->awayEquipe->nom : "Équipe {$awayId}",
                                'logo' => isset($match->awayEquipe) ? ($match->awayEquipe->logo ?? null) : null,
                                'joue' => 0,
                                'gagne' => 0,
                                'nul' => 0,
                                'perdu' => 0,
                                'bp' => 0,
                                'bc' => 0,
                                'diff' => 0,
                                'points' => 0,
                            ];
                        }
                        
                        $sh = (int)($match->score_home ?? 0);
                        $sa = (int)($match->score_away ?? 0);
                        
                        $standings[$homeId]['joue']++;
                        $standings[$awayId]['joue']++;
                        $standings[$homeId]['bp'] += $sh;
                        $standings[$homeId]['bc'] += $sa;
                        $standings[$awayId]['bp'] += $sa;
                        $standings[$awayId]['bc'] += $sh;
                        $standings[$homeId]['diff'] = $standings[$homeId]['bp'] - $standings[$homeId]['bc'];
                        $standings[$awayId]['diff'] = $standings[$awayId]['bp'] - $standings[$awayId]['bc'];
                        
                        if ($sh > $sa) {
                            $standings[$homeId]['gagne']++;
                            $standings[$homeId]['points'] += 3;
                            $standings[$awayId]['perdu']++;
                        } elseif ($sh < $sa) {
                            $standings[$awayId]['gagne']++;
                            $standings[$awayId]['points'] += 3;
                            $standings[$homeId]['perdu']++;
                        } else {
                            $standings[$homeId]['nul']++;
                            $standings[$awayId]['nul']++;
                            $standings[$homeId]['points'] += 1;
                            $standings[$awayId]['points'] += 1;
                        }
                    }
                }
            }
        }
        
        // Trier le classement
        usort($standings, function($a, $b) {
            if ($b['points'] !== $a['points']) {
                return $b['points'] <=> $a['points'];
            }
            if ($b['diff'] !== $a['diff']) {
                return $b['diff'] <=> $a['diff'];
            }
            return $b['bp'] <=> $a['bp'];
        });
        
        $coupeAvecPoule->classementGlobal = $standings;
        
        return $coupeAvecPoule;
    }
}


