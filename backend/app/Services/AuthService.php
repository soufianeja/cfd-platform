<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->assignRole('student');

        $token = $user->createToken('api-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function login(array $data): ?array
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return null;
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }
}