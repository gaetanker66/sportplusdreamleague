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
        // Ajouter equipe_id à cartons
        Schema::table('cartons', function (Blueprint $table) {
            $table->foreignId('equipe_id')->nullable()->after('joueur_id')->constrained('equipes')->nullOnDelete();
        });

        // Ajouter equipe_id à poule_cartons
        Schema::table('poule_cartons', function (Blueprint $table) {
            $table->foreignId('equipe_id')->nullable()->after('joueur_id')->constrained('equipes')->nullOnDelete();
        });

        // Ajouter equipe_id à coupe_cartons
        Schema::table('coupe_cartons', function (Blueprint $table) {
            $table->foreignId('equipe_id')->nullable()->after('joueur_id')->constrained('equipes')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupe_cartons', function (Blueprint $table) {
            $table->dropConstrainedForeignId('equipe_id');
        });

        Schema::table('poule_cartons', function (Blueprint $table) {
            $table->dropConstrainedForeignId('equipe_id');
        });

        Schema::table('cartons', function (Blueprint $table) {
            $table->dropConstrainedForeignId('equipe_id');
        });
    }
};