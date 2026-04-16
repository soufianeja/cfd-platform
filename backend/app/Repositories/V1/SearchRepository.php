<?php

namespace App\Repositories\V1;

use App\Models\CfdProject;
use App\Models\Project;
use App\Models\User;
use App\Models\Tag;

class SearchRepository
{
    public function searchCfdProjects(string $query, int $limit = 5)
    {
        return CfdProject::where('status', 'published')
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->with(['user:id,name,avatar'])
            ->limit($limit)
            ->get();
    }

    public function searchProjects(string $query, int $limit = 5)
    {
        return Project::where('status', 'published')
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->with(['user:id,name,avatar'])
            ->limit($limit)
            ->get();
    }

    public function searchUsers(string $query, int $limit = 5)
    {
        return User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit($limit)
            ->get();
    }

    public function searchTags(string $query, int $limit = 5)
    {
        return Tag::where('name', 'like', "%{$query}%")
            ->limit($limit)
            ->get();
    }
}
