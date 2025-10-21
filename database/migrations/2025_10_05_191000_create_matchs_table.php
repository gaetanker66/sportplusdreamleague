<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matchs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journee_id')->constrained('journees')->cascadeOnDelete();
            $table->foreignId('equipe_home_id')->constrained('equipes')->cascadeOnDelete();
            $table->foreignId('equipe_away_id')->constrained('equipes')->cascadeOnDelete();
            $table->foreignId('gardien_home_id')->nullable()->constrained('joueurs')->nullOnDelete();
            $table->foreignId('gardien_away_id')->nullable()->constrained('joueurs')->nullOnDelete();
            $table->unsignedInteger('arrets_home')->default(0);
            $table->unsignedInteger('arrets_away')->default(0);
            $table->unsignedInteger('score_home')->default(0);
            $table->unsignedInteger('score_away')->default(0);
            $table->boolean('termine')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matchs');
    }
};


