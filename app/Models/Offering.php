<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Offering extends Model
{
    /**
     * Map this model to the classes database table to avoid PHP reserved word clash.
     */
    protected $table = 'classes';

    protected $fillable = ['subject_id', 'professor_id', 'period', 'name'];

    /**
     * Get the subject that this class belongs to.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the professor assigned to teach this class.
     */
    public function professor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    /**
     * Get the student enrollments in this class.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'class_id');
    }

    /**
     * Get the evaluation items registered for this class.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(ClassEvaluation::class, 'class_id');
    }

    /**
     * Get the custom math grading formula associated with this class.
     */
    public function formula(): HasOne
    {
        return $this->hasOne(GradeFormula::class, 'class_id');
    }
}
