<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        $academicTitles = [
            'Machine Learning Applications for Predicting Aerodynamic Drag',
            'Comparative Study of RANS and LES for Automotive Aerodynamics',
            'Advanced Mesh Generation Techniques for Complex Geometries',
            'CFD Investigation of Wind Turbine Blade Efficiency at Low Speeds',
            'Numerical Modeling of Heat Dissipation in Electronic Enclosures',
            'Deep Learning Approaches to Fluid Flow State Reconstruction',
            'Assessment of Cavitation Models for Marine Propellers',
            'Optimization of Airfoil Shapes using Adjoint Solvers in OpenFOAM'
        ];

        $academicDescriptions = [
            'This research explores novel methodologies combining traditional computational fluid dynamics with neural networks to accelerate prediction times without compromising accuracy.',
            'A comprehensive comparative analysis evaluating the computational cost versus accuracy trade-off between Unsteady RANS models and Large Eddy Simulations in bluff body aerodynamics.',
            'Focuses on algorithmic improvements in boundary layer meshing, improving orthogonality and skewness metrics for complex industrial CAD models.',
            'An in-depth study investigating the efficiency drop-off of wind turbines at sub-optimal wind speeds, validated against scaled wind tunnel experiments.'
        ];

        $title = $this->faker->randomElement($academicTitles);

        return [
            'user_id'          => User::factory(),
            'title'            => $title,
            'slug'             => Str::slug($title) . '-' . Str::random(6),
            'description'      => $this->faker->randomElement($academicDescriptions),
            'project_type'     => $this->faker->randomElement([
                'master', 'phd', 'paper', 'article'
            ]),
            'publication_year' => $this->faker->numberBetween(2020, 2026),
            'pdf_file'         => null,
            'external_link'    => $this->faker->optional(0.7)->url(),
            'status'           => 'published',
            'views_count'      => $this->faker->numberBetween(50, 2500),
        ];
    }
}