<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupes', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->unsignedInteger('nombre_equipes');
            $table->timestamps();
        });

        Schema::create('coupe_equipe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupe_id')->constrained('coupes')->cascadeOnDelete();
            $table->foreignId('equipe_id')->constrained('equipes')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['coupe_id','equipe_id']);
        });

        Schema::create('coupe_rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupe_id')->constrained('coupes')->cascadeOnDelete();
            $table->unsignedInteger('numero'); // 1 = 1/32, 2 = 1/16, ..., N = finale
            $table->string('label')->nullable();
            $table->timestamps();
            $table->unique(['coupe_id','numero']);
        });

        Schema::create('coupe_matchs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('round_id')->constrained('coupe_rounds')->cascadeOnDelete();
            $table->foreignId('equipe_home_id')->nullable()->constrained('equipes')->nullOnDelete();
            $table->foreignId('equipe_away_id')->nullable()->constrained('equipes')->nullOnDelete();
            $table->unsignedInteger('score_home')->default(0);
            $table->unsignedInteger('score_away')->default(0);
            $table->boolean('termine')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupe_matchs');
        Schema::dropIfExists('coupe_rounds');
        Schema::dropIfExists('coupe_equipe');
        Schema::dropIfExists('coupes');
    }
};


