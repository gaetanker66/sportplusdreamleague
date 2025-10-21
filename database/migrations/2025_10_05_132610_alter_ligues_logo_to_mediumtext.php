<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to avoid requiring doctrine/dbal for column type change
        DB::statement('ALTER TABLE ligues MODIFY logo MEDIUMTEXT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to TEXT (previous migration changed to TEXT)
        DB::statement('ALTER TABLE ligues MODIFY logo TEXT NULL');
    }
};
