<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Geometry extends Model
{
     use HasFactory;

    protected $fillable = [
        'cfd_project_id', 'name', 'geometry_file',
        'file_type', 'preview_image',
        'description', 'file_size',
        'surface_area', 'volume', 'length', 'width',
        'height', 'frontal_area', 'aspect_ratio'
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function cfdProject()
    {
        return $this->belongsTo(CfdProject::class);
    }

    public function simulations()
    {
        return $this->hasMany(Simulation::class)->latest();
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function getFeaturesAttribute()
    {
        return [
            'surface_area' => $this->surface_area,
            'volume' => $this->volume,
            'length' => $this->length,
            'width' => $this->width,
            'height' => $this->height,
            'frontal_area' => $this->frontal_area,
            'aspect_ratio' => $this->aspect_ratio,
        ];
    }
}
