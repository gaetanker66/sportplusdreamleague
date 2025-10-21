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
            $table->boolean('matchs_aleatoires')->default(true)->after('coupe_modele_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupes', function (Blueprint $table) {
            $table->dropColumn('matchs_aleatoires');
        });
    }
};
