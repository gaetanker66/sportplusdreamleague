<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupe_matchs', function (Blueprint $table) {
            $table->foreignId('gardien_home_id')->nullable()->constrained('joueurs')->nullOnDelete();
            $table->foreignId('gardien_away_id')->nullable()->constrained('joueurs')->nullOnDelete();
            $table->unsignedInteger('arrets_home')->default(0);
            $table->unsignedInteger('arrets_away')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('coupe_matchs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('gardien_home_id');
            $table->dropConstrainedForeignId('gardien_away_id');
            $table->dropColumn('arrets_home');
            $table->dropColumn('arrets_away');
        });
    }
};


