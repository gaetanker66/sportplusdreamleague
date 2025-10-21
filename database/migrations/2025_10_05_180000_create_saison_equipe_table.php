<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saison_equipe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saison_id')->constrained('saisons')->cascadeOnDelete();
            $table->foreignId('equipe_id')->constrained('equipes')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['saison_id', 'equipe_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saison_equipe');
    }
};


