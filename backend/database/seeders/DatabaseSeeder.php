<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\CfdProjectSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Must seed roles first before assigning them
        $this->call([
            RolesAndPermissionsSeeder::class,
        ]);

        // 1. Create Admin Account
        $admin = User::factory()->create([
            'name' => 'Admin Test',
            'email' => 'admin@example.com',
            'password' => bcrypt('admin@example.com'),
        ]);
        $admin->assignRole('admin');

        // 2. Create Reviewer Account
        $reviewer = User::factory()->create([
            'name' => 'Reviewer Test',
            'email' => 'reviewer@example.com',
            'password' => bcrypt('reviewer@example.com'),
        ]);
        $reviewer->assignRole('reviewer');

        // 3. Create Normal User Account
        $user = User::factory()->create([
            'name' => 'User Test',
            'email' => 'user@example.com',
            'password' => bcrypt('user@example.com'),
        ]);
        $user->assignRole('user');

        // Call the rest of the seeders
        $this->call([
            CfdProjectSeeder::class,
        ]);
    }
}
