<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Créer la table pivot pour les rivales
        Schema::create('equipe_rivale', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipe_id')->constrained('equipes')->onDelete('cascade');
            $table->foreignId('rivale_id')->constrained('equipes')->onDelete('cascade');
            $table->timestamps();
            
            // Empêcher les doublons (une équipe ne peut pas avoir la même rivale deux fois)
            $table->unique(['equipe_id', 'rivale_id']);
        });

        // Migrer les données existantes de rival_id vers la table pivot
        // On crée des relations bidirectionnelles (si A est rivale de B, alors B est aussi rivale de A)
        $equipesAvecRival = DB::table('equipes')
            ->whereNotNull('rival_id')
            ->select('id', 'rival_id')
            ->get();

        foreach ($equipesAvecRival as $equipe) {
            // Créer la relation A -> B
            DB::table('equipe_rivale')->insertOrIgnore([
                'equipe_id' => $equipe->id,
                'rivale_id' => $equipe->rival_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Créer la relation inverse B -> A (si elle n'existe pas déjà)
            // Vérifier si B n'a pas déjà un rival_id différent
            $rivale = DB::table('equipes')->where('id', $equipe->rival_id)->first();
            if ($rivale && ($rivale->rival_id === null || $rivale->rival_id === $equipe->id)) {
                DB::table('equipe_rivale')->insertOrIgnore([
                    'equipe_id' => $equipe->rival_id,
                    'rivale_id' => $equipe->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Supprimer la colonne rival_id de la table equipes
        Schema::table('equipes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rival_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recréer la colonne rival_id
        Schema::table('equipes', function (Blueprint $table) {
            $table->foreignId('rival_id')->nullable()->after('description')->constrained('equipes')->nullOnDelete();
        });

        // Migrer les données de la table pivot vers rival_id
        // On prend la première rivale de chaque équipe
        $rivales = DB::table('equipe_rivale')
            ->select('equipe_id', 'rivale_id')
            ->orderBy('equipe_id')
            ->orderBy('id')
            ->get()
            ->groupBy('equipe_id');

        foreach ($rivales as $equipeId => $rivalesGroup) {
            // Prendre la première rivale
            $premiereRivale = $rivalesGroup->first();
            DB::table('equipes')
                ->where('id', $equipeId)
                ->update(['rival_id' => $premiereRivale->rivale_id]);
        }

        // Supprimer la table pivot
        Schema::dropIfExists('equipe_rivale');
    }
};
