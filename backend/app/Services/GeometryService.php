<?php

namespace App\Services;

use App\Models\CfdProject;
use App\Models\Geometry;
use App\Repositories\Interfaces\GeometryRepositoryInterface;
use Illuminate\Support\Facades\Storage;

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

    public function create(CfdProject $cfdProject, array $data, $file, $preview = null): Geometry
    {
        $data['cfd_project_id'] = $cfdProject->id;
        $data['file_type'] = strtolower($file->getClientOriginalExtension());
        $data['file_size'] = $file->getSize();
        $data['geometry_file'] = $file->store('geometries/files', 'public');

        if ($preview) {
            $data['preview_image'] = $preview->store('geometries/previews', 'public');
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
