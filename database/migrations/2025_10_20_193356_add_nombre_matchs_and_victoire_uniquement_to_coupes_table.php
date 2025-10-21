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
            $table->integer('nombre_matchs')->default(1)->after('matchs_aleatoires');
            $table->boolean('victoire_uniquement')->default(false)->after('nombre_matchs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupes', function (Blueprint $table) {
            $table->dropColumn(['nombre_matchs', 'victoire_uniquement']);
        });
    }
};
