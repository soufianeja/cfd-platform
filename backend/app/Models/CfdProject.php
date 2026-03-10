<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class CfdProject extends Model
{
    use HasFactory, SoftDeletes;

    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'software',
        'solver',
        'mesh_cells',
        'reynolds_number',
        'turbulence_model',
        'simulation_type',
        'results_summary',
        'status',
        'views_count',
    ];

    protected $casts = [
        'mesh_cells' => 'integer',
        'reynolds_number' => 'float',
        'views_count' => 'integer',
    ];



    // ---- Relationships ----

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function geometries()
    {
        return $this->hasMany(Geometry::class);
    }

    public function categories()
    {
        return $this->morphToMany(Category::class, 'categorizable');
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    // ---- Scopes ----

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeBySoftware($query, string $software)
    {
        return $query->where('software', $software);
    }
}
