<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SimulationMetric extends Model
{
    protected $fillable = [
        'simulation_id', 'key', 'value', 'unit',
    ];

    public function simulation()
    {
        return $this->belongsTo(Simulation::class);
    }
}
