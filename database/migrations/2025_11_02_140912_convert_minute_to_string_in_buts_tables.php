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
        // Convertir minute en string dans la table buts
        // D'abord convertir les valeurs existantes en string
        DB::statement('UPDATE buts SET minute = CAST(minute AS CHAR) WHERE minute IS NOT NULL');
        
        // Modifier le type de colonne
        Schema::table('buts', function (Blueprint $table) {
            $table->string('minute', 10)->nullable()->change();
        });

        // Convertir minute en string dans la table coupe_buts
        DB::statement('UPDATE coupe_buts SET minute = CAST(minute AS CHAR) WHERE minute IS NOT NULL');
        
        Schema::table('coupe_buts', function (Blueprint $table) {
            $table->string('minute', 10)->nullable()->change();
        });

        // Convertir minute en string dans la table poule_buts
        DB::statement('UPDATE poule_buts SET minute = CAST(minute AS CHAR) WHERE minute IS NOT NULL');
        
        Schema::table('poule_buts', function (Blueprint $table) {
            $table->string('minute', 10)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reconvertir en integer (uniquement si la valeur est numérique)
        DB::statement('UPDATE buts SET minute = CAST(minute AS UNSIGNED) WHERE minute IS NOT NULL AND minute REGEXP "^[0-9]+$"');
        
        Schema::table('buts', function (Blueprint $table) {
            $table->unsignedTinyInteger('minute')->nullable()->change();
        });

        DB::statement('UPDATE coupe_buts SET minute = CAST(minute AS UNSIGNED) WHERE minute IS NOT NULL AND minute REGEXP "^[0-9]+$"');
        
        Schema::table('coupe_buts', function (Blueprint $table) {
            $table->unsignedTinyInteger('minute')->nullable()->change();
        });

        DB::statement('UPDATE poule_buts SET minute = CAST(minute AS SIGNED) WHERE minute IS NOT NULL AND minute REGEXP "^[0-9]+$"');
        
        Schema::table('poule_buts', function (Blueprint $table) {
            $table->integer('minute')->nullable()->change();
        });
    }
};
