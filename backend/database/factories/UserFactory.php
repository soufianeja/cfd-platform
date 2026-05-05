<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $universities = [
            'MIT', 'Stanford University', 'TU Delft', 'ETH Zurich', 
            'Imperial College London', 'Georgia Tech', 'Politecnico di Milano',
            'University of Michigan', 'RWTH Aachen University'
        ];

        $bios = [
            'PhD Researcher specializing in computational aerodynamics and turbulence modeling.',
            'Aerospace Engineering student passionate about F1 and CFD.',
            'Postdoctoral fellow working on Machine Learning applications in Fluid Dynamics.',
            'Senior CFD Engineer with 5+ years of experience in thermal management.',
            'OpenFOAM enthusiast and open-source contributor.'
        ];

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'university' => fake()->optional(0.8)->randomElement($universities),
            'bio' => fake()->optional(0.7)->randomElement($bios),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
