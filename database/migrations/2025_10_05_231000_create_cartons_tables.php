<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cartons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matchs')->cascadeOnDelete();
            $table->foreignId('joueur_id')->constrained('joueurs')->cascadeOnDelete();
            $table->enum('type', ['jaune', 'rouge']);
            $table->unsignedTinyInteger('minute')->nullable();
            $table->timestamps();
        });

        Schema::create('coupe_cartons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupe_match_id')->constrained('coupe_matchs')->cascadeOnDelete();
            $table->foreignId('joueur_id')->constrained('joueurs')->cascadeOnDelete();
            $table->enum('type', ['jaune', 'rouge']);
            $table->unsignedTinyInteger('minute')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupe_cartons');
        Schema::dropIfExists('cartons');
    }
};


