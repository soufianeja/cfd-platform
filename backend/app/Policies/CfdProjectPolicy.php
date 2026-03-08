<?php

namespace App\Policies;

use App\Models\CfdProject;
use App\Models\User;

class CfdProjectPolicy
{
    public function update(User $user, CfdProject $cfdProject): bool
    {
        return $user->id === $cfdProject->user_id || $user->hasRole('admin');
    }

    public function delete(User $user, CfdProject $cfdProject): bool
    {
        return $user->id === $cfdProject->user_id || $user->hasRole('admin');
    }
}