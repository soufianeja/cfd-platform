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

        return [
            'user' => array_merge($user->toArray(), ['role' => $user->role]),
            'token' => $token
        ];
    }

    public function login(array $data): ?array
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return null;
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'user' => array_merge($user->toArray(), ['role' => $user->role]),
            'token' => $token
        ];
    }
}