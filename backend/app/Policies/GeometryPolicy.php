<?php

namespace App\Policies;

use App\Models\Geometry;
use App\Models\User;

class GeometryPolicy
{
    public function modify(User $user, Geometry $geometry): bool
    {
        $projectUserId = $geometry->cfdProject?->user_id;
        return $user->id === $projectUserId || $user->hasRole('admin');
    }
}
