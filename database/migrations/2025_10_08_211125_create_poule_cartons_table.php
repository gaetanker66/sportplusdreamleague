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
        Schema::create('poule_cartons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poule_match_id')->constrained('poule_matchs')->onDelete('cascade');
            $table->foreignId('joueur_id')->constrained('joueurs')->onDelete('cascade');
            $table->string('type'); // jaune, rouge
            $table->integer('minute')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poule_cartons');
    }
};
