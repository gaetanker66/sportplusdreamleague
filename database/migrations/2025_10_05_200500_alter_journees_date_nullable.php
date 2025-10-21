<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE journees MODIFY `date` date NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE journees MODIFY `date` date NOT NULL');
    }
};


