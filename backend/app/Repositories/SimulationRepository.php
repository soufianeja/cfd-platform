<?php

namespace App\Repositories;

use App\Models\Simulation;
use App\Models\SimulationImage;
use App\Repositories\Interfaces\SimulationRepositoryInterface;
use Illuminate\Support\Collection;

class SimulationRepository implements SimulationRepositoryInterface
{
    public function getAllForGeometry(int $geometryId): Collection
    {
        return Simulation::where('geometry_id', $geometryId)
            ->with(['metrics', 'images'])
            ->latest()
            ->get();
    }

    public function find(int $id): ?Simulation
    {
        return Simulation::with(['metrics', 'images'])->findOrFail($id);
    }

    public function create(array $data): Simulation
    {
        return Simulation::create($data);
    }

    public function update(Simulation $simulation, array $data): Simulation
    {
        $simulation->update($data);
        return $simulation->fresh();
    }

    public function delete(Simulation $simulation): bool
    {
        return $simulation->delete();
    }

    public function addMetrics(Simulation $simulation, array $metrics): void
    {
        $simulation->metrics()->createMany(
            array_map(fn($m) => [
                'key'   => $m['key'],
                'value' => $m['value'],
                'unit'  => $m['unit'] ?? null,
            ], $metrics)
        );
    }

    public function addImage(Simulation $simulation, array $imageData): void
    {
        $simulation->images()->create($imageData);
    }

    public function deleteImage(int $imageId): bool
    {
        return SimulationImage::findOrFail($imageId)->delete();
    }
}
