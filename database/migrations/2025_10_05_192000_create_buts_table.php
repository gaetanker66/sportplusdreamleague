<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matchs')->cascadeOnDelete();
            $table->foreignId('equipe_id')->constrained('equipes')->cascadeOnDelete();
            $table->foreignId('buteur_id')->constrained('joueurs')->cascadeOnDelete();
            $table->foreignId('passeur_id')->nullable()->constrained('joueurs')->nullOnDelete();
            $table->unsignedTinyInteger('minute')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buts');
    }
};


