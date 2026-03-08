<?php

namespace App\Repositories;

use App\Models\Project;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ProjectRepository implements ProjectRepositoryInterface
{
    public function getAllPublished(array $filters): LengthAwarePaginator
    {
        return Project::published()
            ->with(['user', 'categories', 'tags'])
            ->when(
                isset($filters['project_type']),
                fn($q) =>
                $q->where('project_type', $filters['project_type'])
            )
            ->when(
                isset($filters['search']),
                fn($q) =>
                $q->where('title', 'like', "%{$filters['search']}%")
            )
            ->latest()
            ->paginate(12);
    }

    public function findBySlug(string $slug): ?Project
    {
        return Project::with([
            'user',
            'categories',
            'tags',
        ])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    public function create(array $data): Project
    {
        return Project::create($data);
    }

    public function update(Project $project, array $data): Project
    {
        $project->update($data);
        return $project->fresh();
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }
}
