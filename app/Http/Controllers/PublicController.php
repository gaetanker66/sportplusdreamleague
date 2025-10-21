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
            $saison = Saison::with(['equipes:id,nom,logo', 'journees.matchs'])
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
            }
        }

        return Inertia::render('classement', [
            'ligues' => $ligues,
            'saisons' => $saisons,
            'selectedLigueId' => $selectedLigueId,
            'selectedSaisonId' => $selectedSaisonId,
            'standings' => $standings,
        ]);
    }

    public function statistiques()
    {
        $ligues = Ligue::orderBy('niveau')->get(['id','nom','niveau']);
        $coupes = Coupe::with('modele')->orderByDesc('created_at')->get(['id','nom','created_at','coupe_modele_id']);
        
        // Debug: vérifier les coupes et leurs modèles
        \Log::info('Coupes chargées:', $coupes->toArray());
        \Log::info('IDs de modèles trouvés:', $coupes->pluck('coupe_modele_id')->filter()->toArray());
        
        // Essayer de charger tous les modèles de coupes disponibles
        $coupeModeles = \App\Models\CoupeModele::orderBy('nom')->get(['id','nom','logo']);
        
        \Log::info('Tous les modèles de coupes:', $coupeModeles->toArray());
        
        $mode = request('mode', 'ligue'); // ligue | tournois
        $selectedLigueId = (int)request('ligue_id', $ligues->first()->id ?? 0);
        $selectedCoupeId = (int)request('coupe_id', $coupes->first()->id ?? 0);
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
                \Log::info('Filtrage par modèle:', ['modele_id' => $selectedModeleId]);
                
                // Filtrer les coupes par modèle
                $coupes = $coupes->filter(function($coupe) use ($selectedModeleId) {
                    return $coupe->coupe_modele_id == $selectedModeleId;
                });
                
                \Log::info('Coupes après filtrage:', $coupes->toArray());
                
                // Mettre à jour la coupe sélectionnée si elle n'est plus dans la liste filtrée
                if (!$coupes->contains('id', $selectedCoupeId)) {
                    $selectedCoupeId = $coupes->first()->id ?? 0;
                }
            }
            
            if ($selectedCoupeId) {
                $stats = $this->getCoupeStats($selectedCoupeId, $type);
            }
        }

        return Inertia::render('statistiques', [
            'ligues' => $ligues,
            'saisons' => $saisons,
            'coupes' => $coupes,
            'coupeModeles' => $coupeModeles,
            'selectedLigueId' => $selectedLigueId,
            'selectedSaisonId' => $selectedSaisonId,
            'selectedCoupeId' => $selectedCoupeId,
            'selectedModeleId' => $selectedModeleId,
            'type' => $type,
            'mode' => $mode,
            'stats' => $stats,
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
        // Charger les coupes normales
        $coupes = Coupe::with(['modele', 'rounds.matchs.homeEquipe', 'rounds.matchs.awayEquipe', 'rounds.matchs.matchRetour.homeEquipe', 'rounds.matchs.matchRetour.awayEquipe'])
            ->orderByDesc('created_at')
            ->get();
        
        // Charger les coupes avec poules
        $coupesAvecPoules = \App\Models\CoupeAvecPoule::with(['modele', 'poules.matchs.homeEquipe', 'poules.matchs.awayEquipe', 'poules.equipes'])
            ->orderByDesc('created_at')
            ->get();
        
        // Combiner les deux listes en ajoutant un type pour les distinguer
        $allCoupes = collect();
        
        // Ajouter les coupes normales
        foreach ($coupes as $coupe) {
            $allCoupes->push((object) array_merge($coupe->toArray(), ['type' => 'coupe']));
        }
        
        // Ajouter les coupes avec poules
        foreach ($coupesAvecPoules as $coupeAvecPoule) {
            $allCoupes->push((object) array_merge($coupeAvecPoule->toArray(), ['type' => 'coupe_avec_poule']));
        }
        
        // Trier par date de création
        $allCoupes = $allCoupes->sortByDesc('created_at')->values();
        
        $selectedCoupeId = (int)($request->query('coupe_id') ?: ($allCoupes->first()->id ?? 0));
        $selectedCoupe = $allCoupes->firstWhere('id', $selectedCoupeId);

        return Inertia::render('coupes', [
            'coupes' => $allCoupes->toArray(),
            'selectedCoupeId' => $selectedCoupeId,
            'selectedCoupe' => $selectedCoupe,
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
        
        if ($type === 'buteur' || $type === 'passeur') {
            // Statistiques des coupes normales (phase finale)
            $coupeButs = \App\Models\CoupeBut::whereHas('match', function($q) use ($coupeId) {
                $q->whereHas('round', function($q2) use ($coupeId){ $q2->where('coupe_id', $coupeId); })
                  ->where('termine', true);
            })->get();
            
            // Statistiques des coupes avec poules (matchs de poules)
            $pouleButs = \App\Models\PouleBut::whereHas('pouleMatch', function($q) use ($coupeId) {
                $q->whereHas('poule', function($q2) use ($coupeId){ $q2->where('coupe_avec_poule_id', $coupeId); })
                  ->where('termine', true);
            })->get();
            
            // Combiner les deux collections
            $allButs = $coupeButs->concat($pouleButs);
            
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
            
            // Matchs de coupes normales (phase finale)
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
            
            // Matchs de poules des coupes avec poules
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
            // Coupes normales (phase finale)
            $coupeButs = \App\Models\CoupeBut::whereHas('match', function($q) use ($coupeId) {
                $q->whereHas('round', function($q2) use ($coupeId){ $q2->where('coupe_id', $coupeId); })
                  ->where('termine', true);
            })->where('type', $type)->get();
            
            // Coupes avec poules (matchs de poules)
            $pouleButs = \App\Models\PouleBut::whereHas('pouleMatch', function($q) use ($coupeId) {
                $q->whereHas('poule', function($q2) use ($coupeId){ $q2->where('coupe_avec_poule_id', $coupeId); })
                  ->where('termine', true);
            })->where('type', $type)->get();
            
            // Combiner les deux collections
            $allButs = $coupeButs->concat($pouleButs);
            
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
            // Coupes normales (phase finale)
            $coupeCartons = \App\Models\CoupeCarton::whereHas('match', function($q) use ($coupeId) {
                $q->whereHas('round', function($q2) use ($coupeId){ $q2->where('coupe_id', $coupeId); })
                  ->where('termine', true);
            })->where('type', $type === 'carton_jaune' ? 'jaune' : 'rouge')->get();
            
            // Coupes avec poules (matchs de poules)
            $pouleCartons = \App\Models\PouleCarton::whereHas('pouleMatch', function($q) use ($coupeId) {
                $q->whereHas('poule', function($q2) use ($coupeId){ $q2->where('coupe_avec_poule_id', $coupeId); })
                  ->where('termine', true);
            })->where('type', $type === 'carton_jaune' ? 'jaune' : 'rouge')->get();
            
            // Combiner les deux collections
            $allCartons = $coupeCartons->concat($pouleCartons);
            
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
}


