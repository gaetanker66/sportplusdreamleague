<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Equipe;
use App\Models\Joueur;
use App\Models\Poste;

class EquipesSeeder extends Seeder
{
    public function run(): void
    {
        $postes = Poste::pluck('id');
        if ($postes->isEmpty()) {
            $labels = ['G', 'DG', 'DD', 'DC', 'MDC', 'MC', 'MOC', 'MG', 'MD', 'AG', 'AD', 'AT', 'BU', 'AVG', 'AVD'];
            foreach ($labels as $label) {
                Poste::firstOrCreate(['nom' => $label]);
            }
            $postes = Poste::pluck('id');
        }

        for ($i = 1; $i <= 40; $i++) {
            $equipe = Equipe::create([
                'nom' => 'Équipe ' . $i,
                'logo' => null,
            ]);

            // ~20 joueurs par équipe
            for ($j = 1; $j <= 20; $j++) {
                $nom = self::randomName();
                $posteId = $postes->random();
                $joueur = $equipe->joueurs()->create([
                    'nom' => $nom,
                    'poste_id' => $posteId,
                    'photo' => null,
                ]);

                // Postes secondaires (0 à 2 aléatoires distincts)
                $secondary = $postes->shuffle()->take(rand(0, 2))->filter(fn ($id) => $id !== $posteId)->values();
                if ($secondary->isNotEmpty()) {
                    $joueur->postesSecondaires()->sync($secondary->all());
                }
            }
        }
    }

    private static function randomName(): string
    {
        $first = ['Alex', 'Jordan', 'Leo', 'Max', 'Sam', 'Noah', 'Evan', 'Hugo', 'Liam', 'Tom', 'Nolan', 'Elyas', 'Kylian', 'Eden', 'Nino', 'Mael', 'Oscar', 'Sacha', 'Théo', 'Yanis'];
        $last = ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard'];
        return $first[array_rand($first)] . ' ' . $last[array_rand($last)];
    }
}


