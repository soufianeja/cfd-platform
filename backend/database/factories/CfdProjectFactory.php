<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CfdProjectFactory extends Factory
{
    public function definition(): array
    {
        $title = $this->faker->sentence(4);
        return [
            'user_id'          => User::factory(),
            'title'            => $title,
            'slug'             => Str::slug($title) . '-' . Str::random(6),
            'description'      => $this->faker->paragraphs(3, true),
            'software'         => $this->faker->randomElement(['OpenFOAM', 'Fluent', 'StarCCM+', 'SU2']),
            'solver'           => $this->faker->randomElement(['simpleFoam', 'pimpleFoam', 'rhoCentralFoam']),
            'mesh_cells'       => $this->faker->numberBetween(100000, 5000000),
            'reynolds_number'  => $this->faker->randomFloat(2, 1000, 1000000),
            'turbulence_model' => $this->faker->randomElement(['k-epsilon', 'k-omega SST', 'LES', 'Spalart-Allmaras']),
            'simulation_type'  => $this->faker->randomElement([
                'external_aero', 'internal_flow',
                'heat_transfer', 'multiphase'
            ]),
            'results_summary'  => $this->faker->paragraph(),
            'status'           => 'published',
            'views_count'      => $this->faker->numberBetween(0, 500),
        ];
    }
}