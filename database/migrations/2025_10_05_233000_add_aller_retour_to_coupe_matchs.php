<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupe_matchs', function (Blueprint $table) {
            $table->boolean('is_aller')->default(true)->after('is_fake');
            $table->foreignId('match_retour_id')->nullable()->constrained('coupe_matchs')->nullOnDelete()->after('is_aller');
            $table->unsignedInteger('score_cumule_home')->default(0)->after('score_away');
            $table->unsignedInteger('score_cumule_away')->default(0)->after('score_cumule_home');
            $table->unsignedInteger('tirs_au_but_home')->nullable()->after('score_cumule_away');
            $table->unsignedInteger('tirs_au_but_away')->nullable()->after('tirs_au_but_home');
        });
    }

    public function down(): void
    {
        Schema::table('coupe_matchs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('match_retour_id');
            $table->dropColumn(['is_aller', 'score_cumule_home', 'score_cumule_away', 'tirs_au_but_home', 'tirs_au_but_away']);
        });
    }
};
