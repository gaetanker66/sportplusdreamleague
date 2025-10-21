<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saison_id')->constrained('saisons')->cascadeOnDelete();
            $table->date('date')->nullable();
            $table->unsignedInteger('numero')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journees');
    }
};


