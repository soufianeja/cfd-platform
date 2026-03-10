<?php

namespace App\Repositories\Interfaces;

use App\Models\Geometry;
use App\Models\Simulation;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface SimulationRepositoryInterface
{
    public function getAllForGeometry(int $geometryId): Collection;
    public function find(int $id): ?Simulation;
    public function create(array $data): Simulation;
    public function update(Simulation $simulation, array $data): Simulation;
    public function delete(Simulation $simulation): bool;
    public function addMetrics(Simulation $simulation, array $metrics): void;
    public function addImage(Simulation $simulation, array $imageData): void;
    public function deleteImage(int $imageId): bool;
}
