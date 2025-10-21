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
        Schema::table('coupes', function (Blueprint $table) {
            $table->foreignId('coupe_modele_id')->nullable()->constrained('coupe_modeles')->nullOnDelete()->after('nombre_equipes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupes', function (Blueprint $table) {
            $table->dropForeign(['coupe_modele_id']);
            $table->dropColumn('coupe_modele_id');
        });
    }
};