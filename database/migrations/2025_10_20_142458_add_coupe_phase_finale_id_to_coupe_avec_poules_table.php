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
        Schema::table('coupe_avec_poules', function (Blueprint $table) {
            $table->unsignedBigInteger('coupe_phase_finale_id')->nullable()->after('phase_finale_generee');
            $table->foreign('coupe_phase_finale_id')->references('id')->on('coupes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupe_avec_poules', function (Blueprint $table) {
            $table->dropForeign(['coupe_phase_finale_id']);
            $table->dropColumn('coupe_phase_finale_id');
        });
    }
};
