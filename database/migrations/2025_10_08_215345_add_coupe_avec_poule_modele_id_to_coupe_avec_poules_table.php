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
        Schema::table('coupe_avec_poules', function (Blueprint $table) {
            $table->foreignId('coupe_avec_poule_modele_id')->nullable()->constrained('coupe_avec_poule_modeles')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupe_avec_poules', function (Blueprint $table) {
            $table->dropForeign(['coupe_avec_poule_modele_id']);
            $table->dropColumn('coupe_avec_poule_modele_id');
        });
    }
};
