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
        Schema::create('poule_buts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poule_match_id')->constrained('poule_matchs')->onDelete('cascade');
            $table->foreignId('equipe_id')->constrained('equipes')->onDelete('cascade');
            $table->foreignId('buteur_id')->constrained('joueurs')->onDelete('cascade');
            $table->foreignId('passeur_id')->nullable()->constrained('joueurs')->onDelete('set null');
            $table->integer('minute')->nullable();
            $table->string('type')->default('normal'); // normal, coup_franc, penalty, csc
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poule_buts');
    }
};
