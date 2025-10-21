<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('coupes', 'saison_id')) {
            Schema::table('coupes', function (Blueprint $table) {
                $table->dropConstrainedForeignId('saison_id');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('coupes', 'saison_id')) {
            Schema::table('coupes', function (Blueprint $table) {
                $table->foreignId('saison_id')->nullable()->constrained('saisons')->nullOnDelete();
            });
        }
    }
};


