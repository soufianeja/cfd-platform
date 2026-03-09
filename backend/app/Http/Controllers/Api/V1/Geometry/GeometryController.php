<?php

namespace App\Http\Controllers\Api\V1\Geometry;

use App\Http\Controllers\Controller;
use App\Http\Requests\Geometry\StoreGeometryRequest;
use App\Http\Resources\Geometry\GeometryResource;
use App\Models\CfdProject;
use App\Models\Geometry;
use App\Services\GeometryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class GeometryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected GeometryService $geometryService)
    {
    }

    public function index(CfdProject $cfdProject): JsonResponse
    {
        $geometries = $this->geometryService->getForProject($cfdProject);

        return response()->json([
            'data' => GeometryResource::collection($geometries),
        ]);
    }

    public function store(StoreGeometryRequest $request, CfdProject $cfdProject): JsonResponse
    {
        $this->authorize('update', $cfdProject);

        $geometry = $this->geometryService->create(
            $cfdProject,
            $request->validated(),
            $request->file('geometry_file'),
            $request->file('preview_image'),
        );

        return response()->json([
            'message' => 'Geometry uploaded successfully.',
            'data' => new GeometryResource($geometry),
        ], 201);
    }

    public function destroy(CfdProject $cfdProject, Geometry $geometry): JsonResponse
    {
        $this->authorize('update', $cfdProject);

        $this->geometryService->delete($geometry);

        return response()->json(['message' => 'Geometry deleted successfully.']);
    }
}
