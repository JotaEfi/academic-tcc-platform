<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enrollment extends Model
{
    protected $fillable = ['class_id', 'student_id', 'final_average', 'status'];

    /**
     * Get the offering class associated with this enrollment.
     */
    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'class_id');
    }

    /**
     * Get the student associated with this enrollment.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the individual evaluation grades for this enrollment.
     */
    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }
}
