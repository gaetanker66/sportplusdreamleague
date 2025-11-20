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
        Schema::create('actualite_joueur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actualite_id')->constrained()->onDelete('cascade');
            $table->foreignId('joueur_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['actualite_id', 'joueur_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actualite_joueur');
    }
};
