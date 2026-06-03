<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassEvaluation extends Model
{
    protected $fillable = ['class_id', 'name', 'code', 'type', 'max_score'];

    /**
     * Get the offering class associated with this evaluation.
     */
    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'class_id');
    }

    /**
     * Get the individual student grades for this evaluation item.
     */
    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }
}
