<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => [
                'id' => $this->id,
                'name' => $this->name,
                'bio' => $this->bio,
                'university' => $this->university,
                'avatar' => $this->avatar,
                'github' => $this->github,
                'linkedin' => $this->linkedin,
                'website' => $this->website,
                'email' => $this->email,
                'role' => $this->role,
                'status' => $this->status,
            ],
            'stats' => [
                'cfd_projects_count' => $this->cfd_projects_count ?? 0,
                'projects_count' => $this->projects_count ?? 0,
                'followers_count' => $this->followers_count ?? 0,
                'following_count' => $this->following_count ?? 0,
                'total_likes' => $this->total_likes ?? 0,
            ],
            'is_following' => $this->is_following ?? false,
        ];
    }
}
