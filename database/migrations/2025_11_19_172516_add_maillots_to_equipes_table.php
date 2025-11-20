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
        Schema::table('equipes', function (Blueprint $table) {
            $table->mediumText('maillot_domicile')->nullable()->after('logo');
            $table->mediumText('maillot_exterieur')->nullable()->after('maillot_domicile');
            $table->mediumText('maillot_3eme')->nullable()->after('maillot_exterieur');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipes', function (Blueprint $table) {
            $table->dropColumn(['maillot_domicile', 'maillot_exterieur', 'maillot_3eme']);
        });
    }
};
