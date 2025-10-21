<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matchs', function (Blueprint $table) {
            if (!Schema::hasColumn('matchs', 'termine')) {
                $table->boolean('termine')->default(false)->after('score_away');
            }
        });
    }

    public function down(): void
    {
        Schema::table('matchs', function (Blueprint $table) {
            if (Schema::hasColumn('matchs', 'termine')) {
                $table->dropColumn('termine');
            }
        });
    }
};


