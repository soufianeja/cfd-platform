<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'icon'];

    public function projects()
    {
        return $this->morphedByMany(Project::class, 'categorizable');
    }

    public function cfdProjects()
    {
        return $this->morphedByMany(CfdProject::class, 'categorizable');
    }
}
