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
        Schema::create('poules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupe_avec_poule_id')->constrained('coupe_avec_poules')->onDelete('cascade');
            $table->string('nom'); // Ex: "Poule A", "Poule B"
            $table->integer('numero'); // 1, 2, 3, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poules');
    }
};
