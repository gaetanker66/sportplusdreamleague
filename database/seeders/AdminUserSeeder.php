<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Vérifier si l'utilisateur admin existe déjà
        $admin = User::where('email', 'admin@sportplusdreamleague.fr')->first();
        
        if (!$admin) {
            User::create([
                'name' => 'Administrateur',
                'email' => 'g.kervarec@b-now.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            
            $this->command->info('Utilisateur admin créé avec succès !');
            $this->command->info('Email: g.kervarec@b-now.com');
            $this->command->info('Mot de passe: password');
            $this->command->warn('⚠️  N\'oubliez pas de changer le mot de passe après la première connexion !');
        } else {
            $this->command->info('L\'utilisateur admin existe déjà.');
        }
    }
}

