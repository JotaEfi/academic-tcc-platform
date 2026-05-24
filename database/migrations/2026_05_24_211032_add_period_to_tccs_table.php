<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tccs', function (Blueprint $table) {
            $table->string('period', 20)->nullable()->after('location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tccs', function (Blueprint $table) {
            $table->dropColumn('period');
        });
    }
};
