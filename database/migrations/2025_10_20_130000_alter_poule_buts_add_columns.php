<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('poule_buts', function (Blueprint $table) {
            if (!Schema::hasColumn('poule_buts', 'poule_match_id')) {
                $table->foreignId('poule_match_id')->after('id')->constrained('poule_matchs')->onDelete('cascade');
            }
            if (!Schema::hasColumn('poule_buts', 'equipe_id')) {
                $table->foreignId('equipe_id')->after('poule_match_id')->constrained('equipes')->onDelete('cascade');
            }
            if (!Schema::hasColumn('poule_buts', 'buteur_id')) {
                $table->foreignId('buteur_id')->after('equipe_id')->constrained('joueurs')->onDelete('cascade');
            }
            if (!Schema::hasColumn('poule_buts', 'passeur_id')) {
                $table->foreignId('passeur_id')->nullable()->after('buteur_id')->constrained('joueurs')->onDelete('set null');
            }
            if (!Schema::hasColumn('poule_buts', 'minute')) {
                $table->integer('minute')->nullable()->after('passeur_id');
            }
            if (!Schema::hasColumn('poule_buts', 'type')) {
                $table->string('type')->default('normal')->after('minute');
            }
        });
    }

    public function down(): void
    {
        Schema::table('poule_buts', function (Blueprint $table) {
            if (Schema::hasColumn('poule_buts', 'type')) { $table->dropColumn('type'); }
            if (Schema::hasColumn('poule_buts', 'minute')) { $table->dropColumn('minute'); }
            if (Schema::hasColumn('poule_buts', 'passeur_id')) { $table->dropConstrainedForeignId('passeur_id'); }
            if (Schema::hasColumn('poule_buts', 'buteur_id')) { $table->dropConstrainedForeignId('buteur_id'); }
            if (Schema::hasColumn('poule_buts', 'equipe_id')) { $table->dropConstrainedForeignId('equipe_id'); }
            if (Schema::hasColumn('poule_buts', 'poule_match_id')) { $table->dropConstrainedForeignId('poule_match_id'); }
        });
    }
};


