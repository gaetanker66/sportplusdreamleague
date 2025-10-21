<?php

namespace App\Http\Controllers;

use App\Models\Journee;
use App\Models\Saison;
use App\Models\MatchModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JourneeController extends Controller
{
    public function generate(Request $request, Saison $saison)
    {
        $saison->load('equipes');
        $equipes = $saison->equipes->pluck('id')->all();
        if (count($equipes) < 2) {
            return back()->withErrors(['equipes' => "Il faut au moins deux équipes pour générer un calendrier."]);
        }

        // Supprimer l'existant si demandé
        $reset = (bool)$request->boolean('reset');
        if ($reset) {
            foreach ($saison->journees as $j) {
                $j->matchs()->delete();
                $j->delete();
            }
        }

        // Génération calendrier double round-robin (aller/retour)
        $teamCount = count($equipes);
        $isOdd = $teamCount % 2 === 1;
        if ($isOdd) {
            $equipes[] = 0; // bye
            $teamCount++;
        }

        // Mélanger l'ordre des équipes pour plus de variété
        shuffle($equipes);

        $rounds = $teamCount - 1; // nombre de journées pour l'aller
        $half = $teamCount / 2;
        $teams = $equipes;
        // Mémorise, pour chaque paire (min-max), qui a été à domicile à l'aller
        $allerOrientation = [];
        // Algorithme cercle (round-robin)
        for ($r = 0; $r < $rounds; $r++) {
            $journeeAller = $saison->journees()->create(['numero' => $r + 1]);
            for ($i = 0; $i < $half; $i++) {
                $a = $teams[$i];
                $b = $teams[$teamCount - 1 - $i];
                if ($a === 0 || $b === 0) continue; // ignorer bye
                // Orientation aléatoire pour l'aller, mémorisée par paire ordonnée (min-max)
                $min = min($a, $b);
                $max = max($a, $b);
                $pairKey = $min . '-' . $max;
                $flip = (bool)random_int(0, 1); // true => on inverse
                $home = $flip ? $b : $a;
                $away = $flip ? $a : $b;
                $allerOrientation[$pairKey] = ($home === $min) ? 'min' : 'max';

                $journeeAller->matchs()->create([
                    'equipe_home_id' => $home,
                    'equipe_away_id' => $away,
                    'termine' => false,
                ]);
            }
            // rotation
            $fixed = array_shift($teams);
            $last = array_pop($teams);
            array_unshift($teams, $fixed);
            array_splice($teams, 1, 0, [$last]);
        }

        // Retour: inverser domicile/extérieur avec numéros qui continuent
        $teams = $equipes;
        for ($r = 0; $r < $rounds; $r++) {
            $journeeRetour = $saison->journees()->create(['numero' => $rounds + $r + 1]);
            for ($i = 0; $i < $half; $i++) {
                $a = $teams[$i];
                $b = $teams[$teamCount - 1 - $i];
                if ($a === 0 || $b === 0) continue;
                $min = min($a, $b);
                $max = max($a, $b);
                $pairKey = $min . '-' . $max;
                $aller = $allerOrientation[$pairKey] ?? 'min';
                // Inversion exacte de l'aller
                if ($aller === 'min') {
                    // min était à domicile à l'aller -> au retour max est à domicile
                    $home = $max; $away = $min;
                } else {
                    $home = $min; $away = $max;
                }
                $journeeRetour->matchs()->create([
                    'equipe_home_id' => $home,
                    'equipe_away_id' => $away,
                    'termine' => false,
                ]);
            }
            // rotation
            $fixed = array_shift($teams);
            $last = array_pop($teams);
            array_unshift($teams, $fixed);
            array_splice($teams, 1, 0, [$last]);
        }

        return back()->with('success', 'Calendrier généré (aller/retour).');
    }
    public function store(Request $request, Saison $saison)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);
        $journee = $saison->journees()->create(['date' => $validated['date']]);
        return back()->with('success', 'Journée créée.');
    }

    public function addMatch(Request $request, Journee $journee)
    {
        $validated = $request->validate([
            'equipe_home_id' => 'required|exists:equipes,id|different:equipe_away_id',
            'equipe_away_id' => 'required|exists:equipes,id',
            'gardien_home_id' => 'nullable|exists:joueurs,id',
            'gardien_away_id' => 'nullable|exists:joueurs,id',
            'arrets_home' => 'nullable|integer|min:0',
            'arrets_away' => 'nullable|integer|min:0',
        ]);
        $journee->matchs()->create($validated + [
            'arrets_home' => $validated['arrets_home'] ?? 0,
            'arrets_away' => $validated['arrets_away'] ?? 0,
        ]);
        return back()->with('success', 'Match ajouté.');
    }
}


