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
        Schema::create('poule_equipe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poule_id')->constrained('poules')->onDelete('cascade');
            $table->foreignId('equipe_id')->constrained('equipes')->onDelete('cascade');
            $table->integer('points')->default(0);
            $table->integer('matchs_joues')->default(0);
            $table->integer('victoires')->default(0);
            $table->integer('nuls')->default(0);
            $table->integer('defaites')->default(0);
            $table->integer('buts_pour')->default(0);
            $table->integer('buts_contre')->default(0);
            $table->integer('difference_buts')->default(0);
            $table->timestamps();
            
            $table->unique(['poule_id', 'equipe_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poule_equipe');
    }
};
