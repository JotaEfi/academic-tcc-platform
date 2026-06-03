<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    protected $fillable = ['enrollment_id', 'class_evaluation_id', 'score'];

    /**
     * Get the student enrollment associated with this grade.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Get the specific evaluation item associated with this grade.
     */
    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(ClassEvaluation::class, 'class_evaluation_id');
    }
}
