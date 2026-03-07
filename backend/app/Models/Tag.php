<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['name', 'slug'];

    public function projects()
    {
        return $this->morphedByMany(Project::class, 'taggable');
    }

    public function cfdProjects()
    {
        return $this->morphedByMany(CfdProject::class, 'taggable');
    }
}
