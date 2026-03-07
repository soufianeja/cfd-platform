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
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function cfdProject()
    {
        return $this->belongsTo(CfdProject::class);
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }
}
