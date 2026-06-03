<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $fillable = ['id', 'name'];

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Get the subjects for the course.
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }
}
