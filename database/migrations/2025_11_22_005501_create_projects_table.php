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
        Schema::create('tccs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('student'); // Nome do aluno (antes era 'leader')
            $table->string('location');
            $table->foreignId('orientador_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('defense_date')->nullable(); // Data da defesa
            $table->string('defense_time')->nullable(); // Horário da defesa (ex: "17:00 às 17:50")
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tccs');
    }
};
