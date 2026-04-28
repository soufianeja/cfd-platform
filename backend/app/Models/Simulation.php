<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Simulation extends Model
{
    use HasFactory;

    protected $fillable = [
        'geometry_id', 'title',
        'description', 'video_result', 'status', 'parameters',
    ];

    protected $casts = [
        'parameters' => 'array',
    ];

    public function geometry()
    {
        return $this->belongsTo(Geometry::class);
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

    public function getMetric(string $key)
    {
        $metric = $this->metrics->where('key', $key)->first();
        return $metric ? (float) $metric->value : null;
    }
}
