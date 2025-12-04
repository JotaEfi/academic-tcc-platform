<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    /**
     * Calcula a nota ponderada da Etapa 2.
     * Os critérios são B1 a B5, os pesos são [1, 4, 8, 8, 8].
     * A nota final é a soma dos produtos dividido por 14.5.
     */
    public function etapa2Score()
    {
        $pesos = [1, 4, 8, 8, 8];
        $scores = $this->scores;
        if (is_string($scores)) {
            $scores = json_decode($scores, true);
        }
        if (!is_array($scores) || count($scores) < 5) {
            return null;
        }
        $total = 0;
        for ($i = 0; $i < 5; $i++) {
            $total += $scores[$i] * $pesos[$i];
        }
        return round($total / 14.5, 2);
    }
    // ...existing code...
    use HasFactory;

    protected $fillable = ['tcc_id', 'user_id', 'stage', 'scores'];

    protected $casts = [
        'scores' => 'array',
    ];

    /**
     * Calcula a nota ponderada da Etapa 1.
     * Os critérios são A1 a A9, os pesos são [1, 1, 1, 1, 4, 2, 6, 6, 6].
     * A nota final é a soma dos produtos dividido por 14.
     */
    public function etapa1Score()
    {
        $pesos = [1, 1, 1, 1, 4, 2, 6, 6, 6];
        $scores = $this->scores;
        if (is_string($scores)) {
            $scores = json_decode($scores, true);
        }
        if (!is_array($scores) || count($scores) < 9) {
            return null;
        }
        $total = 0;
        for ($i = 0; $i < 9; $i++) {
            $total += $scores[$i] * $pesos[$i];
        }
        return round($total / 14, 2);
    }

    public function tcc()
    {
        return $this->belongsTo(Tcc::class);
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
