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
        Schema::create('coupe_avec_poule_modeles', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->longText('logo')->nullable();
            $table->text('description')->nullable();
            $table->integer('nombre_equipes');
            $table->integer('nombre_poules');
            $table->integer('qualifies_par_poule');
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupe_avec_poule_modeles');
    }
};
