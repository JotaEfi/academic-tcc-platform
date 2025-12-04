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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->string('tcc_id'); // Renomeado de project_id
            $table->foreign('tcc_id')->references('id')->on('tccs')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Sempre obrigatório (avaliador da banca)
            $table->string('stage'); // 'etapa1' ou 'etapa2'
            $table->json('scores'); // Notas dos critérios
            $table->timestamps();
            
            // Garantir que um avaliador não avalie a mesma etapa duas vezes
            $table->unique(['tcc_id', 'user_id', 'stage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
