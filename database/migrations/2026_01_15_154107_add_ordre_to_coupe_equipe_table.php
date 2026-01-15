<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('coupe_equipe', function (Blueprint $table) {
            if (!Schema::hasColumn('coupe_equipe', 'ordre')) {
                $table->unsignedInteger('ordre')->default(0)->after('equipe_id');
            }
        });
        
        // Initialiser l'ordre pour les données existantes basé sur created_at
        // Récupérer toutes les coupes
        $coupes = \DB::table('coupes')->pluck('id');
        
        foreach ($coupes as $coupeId) {
            // Pour chaque coupe, récupérer les équipes triées par created_at
            $equipes = \DB::table('coupe_equipe')
                ->where('coupe_id', $coupeId)
                ->orderBy('created_at')
                ->get();
            
            // Mettre à jour l'ordre pour chaque équipe
            foreach ($equipes as $index => $equipe) {
                \DB::table('coupe_equipe')
                    ->where('id', $equipe->id)
                    ->update(['ordre' => $index + 1]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupe_equipe', function (Blueprint $table) {
            $table->dropColumn('ordre');
        });
    }
};
