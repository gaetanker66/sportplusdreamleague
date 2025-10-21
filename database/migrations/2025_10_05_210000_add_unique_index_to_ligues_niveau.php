<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ligues', function (Blueprint $table) {
            if (!Schema::hasColumn('ligues', 'niveau')) {
                $table->unsignedInteger('niveau')->after('logo');
            }
            $table->unique('niveau');
        });
    }

    public function down(): void
    {
        Schema::table('ligues', function (Blueprint $table) {
            $table->dropUnique(['niveau']);
        });
    }
};


