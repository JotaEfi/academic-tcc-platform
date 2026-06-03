<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeFormula extends Model
{
    protected $fillable = ['class_id', 'formula_expression'];

    /**
     * Get the offering class that owns this formula.
     */
    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'class_id');
    }
}
