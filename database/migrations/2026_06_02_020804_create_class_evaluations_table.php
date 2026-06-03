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
        Schema::create('class_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->onDelete('cascade');
            $table->string('name'); // e.g. Prova 1
            $table->string('code'); // e.g. P1
            $table->string('type'); // e.g. prova, trabalho, projeto, etc.
            $table->decimal('max_score', 5, 2)->default(10.00);
            $table->timestamps();

            $table->unique(['class_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_evaluations');
    }
};
