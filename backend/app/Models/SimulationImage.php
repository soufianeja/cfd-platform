<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SimulationImage extends Model
{
     protected $fillable = [
        'simulation_id', 'path',
        'type', 'caption', 'order',
    ];

    public function simulation()
    {
        return $this->belongsTo(Simulation::class);
    }
}
