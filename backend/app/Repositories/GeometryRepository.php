<?php

namespace App\Repositories;

use App\Models\Geometry;
use App\Repositories\Interfaces\GeometryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class GeometryRepository implements GeometryRepositoryInterface
{
    public function getForProject(int $cfdProjectId)
    {
        return Geometry::where('cfd_project_id', $cfdProjectId)
            ->latest()
            ->get();
    }

    public function getAllPublic(array $filters): LengthAwarePaginator
    {
        return Geometry::with('cfdProject')
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($filters['type']   ?? null, fn($q, $t) => $q->where('file_type', $t))
            ->orderBy('created_at', 'desc')
            ->paginate(18);
    }

    public function find(int $id): ?Geometry
    {
        return Geometry::findOrFail($id);
    }

    public function create(array $data): Geometry
    {
        return Geometry::create($data);
    }

    public function update(Geometry $geometry, array $data): Geometry
    {
        $geometry->update($data);
        return $geometry->fresh();
    }

    public function delete(Geometry $geometry): bool
    {
        return $geometry->delete();
    }
}
