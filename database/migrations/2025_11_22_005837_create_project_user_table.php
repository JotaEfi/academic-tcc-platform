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
        Schema::create('tcc_evaluator', function (Blueprint $table) {
            $table->id();
            $table->string('tcc_id'); // Renomeado de project_id
            $table->foreign('tcc_id')->references('id')->on('tccs')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Avaliador (professor da banca)
            $table->timestamps();
            
            // Garantir que um avaliador não seja adicionado duas vezes no mesmo TCC
            $table->unique(['tcc_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tcc_evaluator');
    }
};
