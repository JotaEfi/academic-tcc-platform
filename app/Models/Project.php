<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'title', 'leader', 'location'];
    public $incrementing = false;
    protected $keyType = 'string';

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function getAverageGradeAttribute()
    {
        $evaluations = $this->evaluations;
        if ($evaluations->isEmpty()) {
            return 0;
        }

        $totalScore = 0;
        $count = 0;

        foreach ($evaluations as $evaluation) {
            // Assuming 'scores' is stored as JSON and we want the average of all criteria
            // Adjust logic if 'scores' structure is different or if we only want professor evaluations
            // Based on previous AdminController logic, we might need to filter by user role if strictness is required
            // For now, taking all evaluations linked to the project
            
            $scores = $evaluation->scores;
            if (is_string($scores)) {
                $scores = json_decode($scores, true);
            }
            
            if (is_array($scores)) {
                 $evaluationAverage = array_sum($scores) / count($scores);
                 $totalScore += $evaluationAverage;
                 $count++;
            }
        }

        return $count > 0 ? round($totalScore / $count, 2) : 0;
    }

    protected $appends = ['average_grade'];
}
