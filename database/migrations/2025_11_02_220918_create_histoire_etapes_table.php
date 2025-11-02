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
        Schema::create('histoire_etapes', function (Blueprint $table) {
            $table->id();
            $table->string('titre'); // Titre de l'étape (ex: "L'avant Dream League", "A jamais les premiers")
            $table->string('date_label')->nullable(); // Label de date affiché (ex: "2022", "Avant 2022")
            $table->date('date')->nullable(); // Date réelle pour le tri
            $table->text('description')->nullable(); // Description/contenu de l'étape
            $table->text('image')->nullable(); // Image de l'étape (base64 ou URL)
            $table->integer('ordre')->default(0); // Ordre d'affichage
            $table->boolean('actif')->default(true); // Afficher ou non cette étape
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('histoire_etapes');
    }
};
