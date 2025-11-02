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
        $constraintName = 'coupe_avec_poules_coupe_avec_poule_modele_id_foreign';
        
        // Vérifier si la contrainte existe déjà
        $constraintExists = DB::select(
            "SELECT CONSTRAINT_NAME 
             FROM information_schema.KEY_COLUMN_USAGE 
             WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = 'coupe_avec_poules' 
             AND CONSTRAINT_NAME = ?",
            [$constraintName]
        );

        if (empty($constraintExists)) {
            Schema::table('coupe_avec_poules', function (Blueprint $table) {
                $table->foreign('coupe_avec_poule_modele_id')
                      ->references('id')
                      ->on('coupe_avec_poule_modeles')
                      ->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupe_avec_poules', function (Blueprint $table) {
            $table->dropForeign(['coupe_avec_poule_modele_id']);
        });
    }
};
