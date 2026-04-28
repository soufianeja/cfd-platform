<?php

namespace App\Services;

use App\Models\CfdProject;
use App\Models\Geometry;
use App\Repositories\Interfaces\GeometryRepositoryInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class GeometryService
{
    public function __construct(
        protected GeometryRepositoryInterface $repository
    ) {
    }

    public function getForProject(CfdProject $cfdProject)
    {
        return $this->repository->getForProject($cfdProject->id);
    }

    public function getAllPublic(array $filters): \Illuminate\Pagination\LengthAwarePaginator
    {
        return $this->repository->getAllPublic($filters);
    }

    public function create(CfdProject $cfdProject, array $data, $file, $preview = null): Geometry
    {
        $data['cfd_project_id'] = $cfdProject->id;
        $data['file_type'] = strtolower($file->getClientOriginalExtension());
        $data['file_size'] = $file->getSize();
        $data['geometry_file'] = $file->store('geometries/files', 'public');

        if ($preview) {
            $data['preview_image'] = $preview->store('geometries/previews', 'public');
        }

        // Extract features via ML Service
        try {
            $response = Http::timeout(15)->attach(
                'file', file_get_contents($file->path()), $file->getClientOriginalName()
            )->post(config('services.ml.url') . '/api/v1/features/extract');

            if ($response->successful()) {
                $features = $response->json();
                $data['surface_area'] = $features['surface_area'] ?? null;
                $data['volume'] = $features['volume'] ?? null;
                $data['length'] = $features['length'] ?? null;
                $data['width'] = $features['width'] ?? null;
                $data['height'] = $features['height'] ?? null;
                $data['frontal_area'] = $features['frontal_area'] ?? null;
                $data['aspect_ratio'] = $features['aspect_ratio'] ?? null;
            } else {
                \Illuminate\Support\Facades\Log::warning('ML extraction failed for geometry: ' . $response->body());
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('ML extraction exception: ' . $e->getMessage());
        }

        return $this->repository->create($data);
    }

    public function delete(Geometry $geometry): bool
    {
        Storage::disk('public')->delete($geometry->geometry_file);
        if ($geometry->preview_image) {
            Storage::disk('public')->delete($geometry->preview_image);
        }
        return $this->repository->delete($geometry);
    }
}
