<?php

namespace App\Http\Controllers\Api\V1\Geometry;

use App\Http\Controllers\Controller;
use App\Http\Requests\Geometry\StoreGeometryRequest;
use App\Http\Resources\Geometry\GeometryResource;
use App\Models\CfdProject;
use App\Models\Geometry;
use App\Services\GeometryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeometryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected GeometryService $geometryService)
    {}

    /**
     * List all geometries for a single CFD project.
     */
    public function index(CfdProject $cfdProject): JsonResponse
    {
        $geometries = $this->geometryService->getForProject($cfdProject);

        return response()->json([
            'data' => GeometryResource::collection($geometries),
        ]);
    }

    /**
     * Public geometry store — all geometries across all projects, paginated & filtered.
     */
    public function all(Request $request): JsonResponse
    {
        $paginator = $this->geometryService->getAllPublic($request->only(['search', 'type']));

        return response()->json([
            'data' => GeometryResource::collection($paginator),
            'meta' => [
                'total'        => $paginator->total(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Upload a new geometry file to a project.
     */
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
            'data'    => new GeometryResource($geometry),
        ], 201);
    }

    /**
     * Delete a geometry and its files.
     */
    public function destroy(CfdProject $cfdProject, Geometry $geometry): JsonResponse
    {
        $this->authorize('modify', $geometry);

        $this->geometryService->delete($geometry);

        return response()->json(['message' => 'Geometry deleted successfully.']);
    }
}
