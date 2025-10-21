<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buts', function (Blueprint $table) {
            $table->enum('type', ['normal', 'coup_franc', 'penalty', 'csc'])->default('normal')->after('minute');
        });

        Schema::table('coupe_buts', function (Blueprint $table) {
            $table->enum('type', ['normal', 'coup_franc', 'penalty', 'csc'])->default('normal')->after('minute');
        });
    }

    public function down(): void
    {
        Schema::table('buts', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        Schema::table('coupe_buts', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
