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
        Schema::create('poule_matchs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poule_id')->constrained('poules')->onDelete('cascade');
            $table->foreignId('equipe_home_id')->constrained('equipes')->onDelete('cascade');
            $table->foreignId('equipe_away_id')->constrained('equipes')->onDelete('cascade');
            $table->integer('score_home')->default(0);
            $table->integer('score_away')->default(0);
            $table->boolean('termine')->default(false);
            $table->foreignId('gardien_home_id')->nullable()->constrained('joueurs')->onDelete('set null');
            $table->foreignId('gardien_away_id')->nullable()->constrained('joueurs')->onDelete('set null');
            $table->integer('arrets_home')->default(0);
            $table->integer('arrets_away')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poule_matchs');
    }
};
