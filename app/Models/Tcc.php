<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tcc extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'title', 'student', 'location', 'period', 'orientador_id', 'defense_date', 'defense_time'];
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'defense_date' => 'date',
    ];

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    public function evaluators()
    {
        return $this->belongsToMany(User::class, 'tcc_evaluator');
    }

    public function orientador()
    {
        return $this->belongsTo(User::class, 'orientador_id');
    }

    // ...existing code...
}
