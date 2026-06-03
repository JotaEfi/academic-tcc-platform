<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    protected $fillable = ['course_id', 'code', 'name'];

    /**
     * Get the course that owns this subject.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the offerings (classes) for this subject.
     */
    public function offerings(): HasMany
    {
        return $this->hasMany(Offering::class);
    }
}
