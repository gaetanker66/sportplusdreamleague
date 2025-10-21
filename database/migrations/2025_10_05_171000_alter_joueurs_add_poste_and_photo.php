<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('joueurs', function (Blueprint $table) {
            $table->foreignId('poste_id')->nullable()->after('equipe_id')->constrained('postes')->nullOnDelete();
            $table->mediumText('photo')->nullable()->after('nom');
        });

        Schema::create('joueur_poste', function (Blueprint $table) {
            $table->id();
            $table->foreignId('joueur_id')->constrained('joueurs')->cascadeOnDelete();
            $table->foreignId('poste_id')->constrained('postes')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['joueur_id', 'poste_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('joueur_poste');
        Schema::table('joueurs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('poste_id');
            $table->dropColumn('photo');
        });
    }
};


