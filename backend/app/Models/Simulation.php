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
        'ml_review_status', 'ml_validated_at',
    ];

    protected $casts = [
        'parameters'     => 'array',
        'ml_validated_at' => 'datetime',
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

    public function reviews()
    {
        return $this->morphMany(\App\Models\Review::class, 'reviewable');
    }

    public function getMetric(string $key)
    {
        $metric = $this->metrics->first(function ($item) use ($key) {
            return strtolower(trim($item->key)) === strtolower(trim($key));
        });
        return $metric ? (float) $metric->value : null;
    }
}
