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
        Schema::table('matchs', function (Blueprint $table) {
            $table->foreignId('homme_du_match_id')->nullable()->after('termine')->constrained('joueurs')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matchs', function (Blueprint $table) {
            $table->dropForeign(['homme_du_match_id']);
            $table->dropColumn('homme_du_match_id');
        });
    }
};
