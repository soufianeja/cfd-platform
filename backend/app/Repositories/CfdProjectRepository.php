<?php

namespace App\Repositories;

use App\Models\CfdProject;
use App\Repositories\Interfaces\CfdProjectRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CfdProjectRepository implements CfdProjectRepositoryInterface
{
    public function getAllPublished(array $filters): LengthAwarePaginator
    {
        return CfdProject::published()
            ->with(['user', 'categories', 'tags']) // eager load — no N+1
            ->when(
                isset($filters['software']),
                fn($q) =>
                $q->where('software', $filters['software'])
            )
            ->when(
                isset($filters['simulation_type']),
                fn($q) =>
                $q->where('simulation_type', $filters['simulation_type'])
            )
            ->when(
                isset($filters['search']),
                fn($q) =>
                $q->where('title', 'like', "%{$filters['search']}%")
            )
            ->latest()
            ->paginate(12);
    }

    public function findBySlug(string $slug): ?CfdProject
    {
        return CfdProject::with([
            'user',
            'categories',
            'tags',
            'geometries',
        ])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    public function create(array $data): CfdProject
    {
        return CfdProject::create($data);
    }

    public function update(CfdProject $project, array $data): CfdProject
    {
        $project->update($data);
        return $project->fresh(); // return updated instance from DB
    }

    public function delete(CfdProject $project): void
    {
        $project->delete(); // soft delete
    }
}