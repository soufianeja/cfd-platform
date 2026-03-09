<?php

namespace App\Repositories\Interfaces;

use App\Models\Geometry;

interface GeometryRepositoryInterface
{
    public function getForProject(int $cfdProjectId);
    public function find(int $id): ?Geometry;
    public function create(array $data): Geometry;
    public function update(Geometry $geometry, array $data): Geometry;
    public function delete(Geometry $geometry): bool;
}
