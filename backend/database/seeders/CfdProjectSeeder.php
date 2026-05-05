<?php

namespace Database\Seeders;

use App\Models\CfdProject;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class CfdProjectSeeder extends Seeder
{
    public function run(): void
    {
        User::factory(3)->create()->each(function ($user) {
        $user->assignRole('user');

        CfdProject::factory(3)->create(['user_id' => $user->id]);
        Project::factory(3)->create(['user_id' => $user->id]);
    });
    }
}