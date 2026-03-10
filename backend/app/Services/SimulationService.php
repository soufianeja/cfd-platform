<?php

namespace App\Services;

use App\Models\Geometry;
use App\Models\Simulation;
use App\Repositories\Interfaces\SimulationRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;

class SimulationService
{
    public function __construct(
        protected SimulationRepositoryInterface $repository
    ) {}

    public function getAllForGeometry(Geometry $geometry): Collection
    {
        return $this->repository->getAllForGeometry($geometry->id);
    }

    public function find(int $id): Simulation
    {
        return $this->repository->find($id);
    }

    public function create(Geometry $geometry, array $data, array $images = []): Simulation
    {
        $simulation = $this->repository->create([
            'geometry_id' => $geometry->id,
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'status'      => $data['status'],
        ]);

        if (!empty($data['metrics'])) {
            $this->repository->addMetrics($simulation, $data['metrics']);
        }

        $this->storeImages($simulation, $images, $data);

        $simulation->load(['metrics', 'images']);
        return $simulation;
    }

    public function update(Simulation $simulation, array $data, array $newImages = []): Simulation
    {
        $this->repository->update($simulation, array_filter([
            'title'       => $data['title']       ?? null,
            'description' => $data['description'] ?? null,
            'status'      => $data['status']       ?? null,
        ], fn($v) => $v !== null));

        if (array_key_exists('metrics', $data)) {
            $simulation->metrics()->delete();
            if (!empty($data['metrics'])) {
                $this->repository->addMetrics($simulation, $data['metrics']);
            }
        }

        $this->storeImages($simulation, $newImages, $data);

        $simulation->load(['metrics', 'images']);
        return $simulation;
    }

    public function addMetrics(Simulation $simulation, array $metrics): Simulation
    {
        $this->repository->addMetrics($simulation, $metrics);
        $simulation->load(['metrics', 'images']);
        return $simulation;
    }

    public function addImage(Simulation $simulation, UploadedFile $file, string $type, ?string $caption, int $order): Simulation
    {
        $path = $file->store('simulations/images', 'public');

        $this->repository->addImage($simulation, [
            'path'    => $path,
            'type'    => $type,
            'caption' => $caption,
            'order'   => $order,
        ]);

        $simulation->load(['metrics', 'images']);
        return $simulation;
    }

    public function deleteImage(Simulation $simulation, int $imageId): void
    {
        $image = $simulation->images()->findOrFail($imageId);
        Storage::disk('public')->delete($image->path);
        $this->repository->deleteImage($imageId);
    }

    public function delete(Simulation $simulation): bool
    {
        // Clean up images from storage
        foreach ($simulation->images as $img) {
            Storage::disk('public')->delete($img->path);
        }
        return $this->repository->delete($simulation);
    }

    // ---- Private helpers ----

    private function storeImages(Simulation $simulation, array $files, array $data): void
    {
        if (empty($files)) return;

        $types    = $data['image_types']    ?? [];
        $captions = $data['image_captions'] ?? [];
        $order    = $simulation->images()->count();

        foreach ($files as $i => $file) {
            $path = $file->store('simulations/images', 'public');
            $this->repository->addImage($simulation, [
                'path'    => $path,
                'type'    => $types[$i]    ?? 'other',
                'caption' => $captions[$i] ?? null,
                'order'   => $order + $i,
            ]);
        }
    }
}
