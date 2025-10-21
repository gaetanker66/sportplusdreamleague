<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupe_matchs', function (Blueprint $table) {
            $table->boolean('is_fake')->default(false)->after('termine');
        });
    }

    public function down(): void
    {
        Schema::table('coupe_matchs', function (Blueprint $table) {
            $table->dropColumn('is_fake');
        });
    }
};


