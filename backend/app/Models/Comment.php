<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'commentable_id',
        'commentable_type', 'parent_id', 'content',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function commentable()
    {
        return $this->morphTo();
    }

    // Direct replies to this comment
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    // Parent comment (if this is a reply)
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }
}
