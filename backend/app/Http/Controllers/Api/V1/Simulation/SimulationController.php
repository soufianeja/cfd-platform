<?php

namespace App\Http\Controllers\Api\V1\Simulation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Simulation\StoreSimulationRequest;
use App\Http\Requests\Simulation\UpdateSimulationRequest;
use App\Http\Resources\Simulation\SimulationResource;
use App\Models\Geometry;
use App\Models\Simulation;
use App\Services\SimulationService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SimulationController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected SimulationService $service
    ) {}

    /**
     * List all simulations for a geometry.
     */
    public function index(Geometry $geometry): JsonResponse
    {
        $simulations = $this->service->getAllForGeometry($geometry);

        return response()->json([
            'data' => SimulationResource::collection($simulations),
        ]);
    }

    /**
     * Show a single simulation.
     */
    public function show(Geometry $geometry, Simulation $simulation): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);

        $simulation->load(['metrics', 'images']);

        return response()->json([
            'data' => new SimulationResource($simulation),
        ]);
    }

    /**
     * Create a new simulation with metrics and images.
     */
    public function store(StoreSimulationRequest $request, Geometry $geometry): JsonResponse
    {
        $this->authorize('update', $geometry->cfdProject);

        $simulation = $this->service->create(
            $geometry,
            $request->validated(),
            $request->file('images', [])
        );

        return response()->json([
            'message' => 'Simulation created successfully.',
            'data'    => new SimulationResource($simulation),
        ], 201);
    }

    /**
     * Update an existing simulation.
     */
    public function update(UpdateSimulationRequest $request, Geometry $geometry, Simulation $simulation): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);
        $this->authorize('update', $geometry->cfdProject);

        $simulation = $this->service->update(
            $simulation,
            $request->validated(),
            $request->file('images', [])
        );

        return response()->json([
            'message' => 'Simulation updated successfully.',
            'data'    => new SimulationResource($simulation),
        ]);
    }

    /**
     * Append metrics to a simulation (inline from detail page).
     */
    public function storeMetrics(Request $request, Geometry $geometry, Simulation $simulation): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);
        $this->authorize('modify', $simulation);

        $request->validate([
            'metrics'         => ['required', 'array', 'min:1'],
            'metrics.*.key'   => ['required', 'string', 'max:100'],
            'metrics.*.value' => ['required', 'numeric'],
            'metrics.*.unit'  => ['nullable', 'string', 'max:50'],
        ]);

        $simulation = $this->service->addMetrics($simulation, $request->metrics);

        return response()->json([
            'message' => 'Metrics added.',
            'data'    => new SimulationResource($simulation),
        ]);
    }

    /**
     * Upload a single image (inline from detail page).
     */
    public function storeImage(Request $request, Geometry $geometry, Simulation $simulation): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);
        $this->authorize('modify', $simulation);

        $request->validate([
            'image'   => ['required', 'file', 'image', 'max:5120'],
            'type'    => ['required', 'in:pressure,velocity,streamlines,mesh,residuals,temperature,other'],
            'caption' => ['nullable', 'string', 'max:255'],
            'order'   => ['nullable', 'integer'],
        ]);

        $order = $simulation->images()->count();

        $simulation = $this->service->addImage(
            $simulation,
            $request->file('image'),
            $request->type,
            $request->caption,
            $request->input('order', $order)
        );

        return response()->json([
            'message' => 'Image uploaded.',
            'data'    => new SimulationResource($simulation),
        ]);
    }

    /**
     * Delete a specific image.
     */
    public function destroyImage(Geometry $geometry, Simulation $simulation, int $imageId): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);
        $this->authorize('modify', $simulation);

        $this->service->deleteImage($simulation, $imageId);

        return response()->json(['message' => 'Image deleted.']);
    }

    /**
     * Delete a simulation.
     */
    public function destroy(Geometry $geometry, Simulation $simulation): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);
        $this->authorize('modify', $simulation);

        $this->service->delete($simulation);

        return response()->json(['message' => 'Simulation deleted successfully.']);
    }
}
