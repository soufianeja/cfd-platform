<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        $title = $this->faker->sentence(4);

        return [
            'user_id'          => User::factory(),
            'title'            => $title,
            'slug'             => Str::slug($title) . '-' . Str::random(6),
            'description'      => $this->faker->paragraphs(3, true),
            'project_type'     => $this->faker->randomElement([
                'master', 'phd', 'paper', 'article'
            ]),
            'publication_year' => $this->faker->numberBetween(2018, 2025),
            'pdf_file'         => null,
            'external_link'    => $this->faker->optional()->url(),
            'status'           => 'published',
            'views_count'      => $this->faker->numberBetween(0, 300),
        ];
    }
}