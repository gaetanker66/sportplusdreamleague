<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupe_buts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupe_match_id')->constrained('coupe_matchs')->cascadeOnDelete();
            $table->foreignId('equipe_id')->constrained('equipes')->cascadeOnDelete();
            $table->foreignId('buteur_id')->constrained('joueurs')->cascadeOnDelete();
            $table->foreignId('passeur_id')->nullable()->constrained('joueurs')->nullOnDelete();
            $table->unsignedTinyInteger('minute')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupe_buts');
    }
};


