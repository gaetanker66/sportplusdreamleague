<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('poule_matchs', function (Blueprint $table) {
            $table->integer('journee')->nullable()->after('poule_id');
            $table->index('journee');
        });
    }

    public function down(): void
    {
        Schema::table('poule_matchs', function (Blueprint $table) {
            $table->dropIndex(['journee']);
            $table->dropColumn('journee');
        });
    }
};


