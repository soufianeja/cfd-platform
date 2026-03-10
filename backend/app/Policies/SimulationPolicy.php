<?php

namespace App\Policies;

use App\Models\Simulation;
use App\Models\User;

class SimulationPolicy
{
    public function modify(User $user, Simulation $simulation): bool
    {
        $projectUserId = $simulation->geometry?->cfdProject?->user_id;
        return $user->id === $projectUserId || $user->hasRole('admin');
    }
}
