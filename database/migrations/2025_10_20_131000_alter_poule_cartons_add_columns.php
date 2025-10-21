<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('poule_cartons', function (Blueprint $table) {
            if (!Schema::hasColumn('poule_cartons', 'poule_match_id')) {
                $table->foreignId('poule_match_id')->after('id')->constrained('poule_matchs')->onDelete('cascade');
            }
            if (!Schema::hasColumn('poule_cartons', 'joueur_id')) {
                $table->foreignId('joueur_id')->after('poule_match_id')->constrained('joueurs')->onDelete('cascade');
            }
            if (!Schema::hasColumn('poule_cartons', 'type')) {
                $table->string('type')->after('joueur_id');
            }
            if (!Schema::hasColumn('poule_cartons', 'minute')) {
                $table->integer('minute')->nullable()->after('type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('poule_cartons', function (Blueprint $table) {
            if (Schema::hasColumn('poule_cartons', 'minute')) { $table->dropColumn('minute'); }
            if (Schema::hasColumn('poule_cartons', 'type')) { $table->dropColumn('type'); }
            if (Schema::hasColumn('poule_cartons', 'joueur_id')) { $table->dropConstrainedForeignId('joueur_id'); }
            if (Schema::hasColumn('poule_cartons', 'poule_match_id')) { $table->dropConstrainedForeignId('poule_match_id'); }
        });
    }
};


