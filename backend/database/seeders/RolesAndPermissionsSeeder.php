<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cache
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    // Create permissions
    $permissions = [
        'publish_project',
        'publish_cfd_project',
        'delete_any_project',
        'archive_project',
        'submit_for_review',
        'review_project',
        'approve_project',
        'reject_project',
        'manage_users',
        'ban_user',
        'delete_any_comment',
    ];

    foreach ($permissions as $permission) {
        Permission::create(['name' => $permission]);
    }

    // Create roles and assign permissions
    Role::create(['name' => 'admin'])
        ->givePermissionTo(Permission::all());

    Role::create(['name' => 'reviewer'])
        ->givePermissionTo([
            'review_project',
            'approve_project',
            'reject_project',
            'delete_any_comment',
        ]);

    Role::create(['name' => 'researcher'])
        ->givePermissionTo([
            'publish_project',
            'publish_cfd_project',
            'submit_for_review',
            'archive_project',
        ]);

    Role::create(['name' => 'student'])
        ->givePermissionTo([
            'publish_project',
            'publish_cfd_project',
            'submit_for_review',
        ]);
    }
}
