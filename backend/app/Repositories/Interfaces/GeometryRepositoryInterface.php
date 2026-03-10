<?php

namespace App\Repositories\Interfaces;

use App\Models\Geometry;
use Illuminate\Pagination\LengthAwarePaginator;

interface GeometryRepositoryInterface
{
    public function getForProject(int $cfdProjectId);
    public function getAllPublic(array $filters): LengthAwarePaginator;
    public function find(int $id): ?Geometry;
    public function create(array $data): Geometry;
    public function update(Geometry $geometry, array $data): Geometry;
    public function delete(Geometry $geometry): bool;
}
