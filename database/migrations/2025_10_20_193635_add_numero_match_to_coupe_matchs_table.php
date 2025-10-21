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
        Schema::table('coupe_matchs', function (Blueprint $table) {
            $table->integer('numero_match')->nullable()->after('is_aller');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupe_matchs', function (Blueprint $table) {
            $table->dropColumn('numero_match');
        });
    }
};
