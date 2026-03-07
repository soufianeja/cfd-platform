<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Simulation extends Model
{
    use HasFactory;

    protected $fillable = [
        'cfd_project_id', 'title',
        'description', 'video_result', 'status',
    ];

    public function cfdProject()
    {
        return $this->belongsTo(CfdProject::class);
    }

    public function images()
    {
        return $this->hasMany(SimulationImage::class)->orderBy('order');
    }

    public function metrics()
    {
        return $this->hasMany(SimulationMetric::class);
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }
}
