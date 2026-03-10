<?php

namespace App\Http\Controllers\Api\V1\Simulation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Simulation\StoreSimulationRequest;
use App\Http\Requests\Simulation\UpdateSimulationRequest;
use App\Http\Resources\Simulation\SimulationResource;
use App\Models\Geometry;
use App\Models\Simulation;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SimulationController extends Controller
{
    use AuthorizesRequests;

    /**
     * List all simulations for a geometry.
     */
    public function index(Geometry $geometry): JsonResponse
    {
        $simulations = $geometry->simulations()
            ->with(['metrics', 'images'])
            ->get();

        return response()->json([
            'data' => SimulationResource::collection($simulations),
        ]);
    }

    /**
     * Create a new simulation and its metrics.
     */
    public function store(StoreSimulationRequest $request, Geometry $geometry): JsonResponse
    {
        $this->authorize('update', $geometry->cfdProject);

        $validated = $request->validated();

        $simulation = $geometry->simulations()->create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status'      => $validated['status'],
        ]);

        // Bulk-insert metrics
        if (!empty($validated['metrics'])) {
            $simulation->metrics()->createMany(
                array_map(fn($m) => [
                    'key'   => $m['key'],
                    'value' => $m['value'],
                    'unit'  => $m['unit'] ?? null,
                ], $validated['metrics'])
            );
        }

        // Store uploaded images
        $this->storeImages($request, $simulation);

        $simulation->load(['metrics', 'images']);

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

        $simulation->update($request->only(['title', 'description', 'status']));

        // Replace metrics if provided
        if ($request->has('metrics')) {
            $simulation->metrics()->delete();
            if (!empty($request->metrics)) {
                $simulation->metrics()->createMany(
                    array_map(fn($m) => [
                        'key'   => $m['key'],
                        'value' => $m['value'],
                        'unit'  => $m['unit'] ?? null,
                    ], $request->metrics)
                );
            }
        }

        // Add new images
        $this->storeImages($request, $simulation);

        $simulation->load(['metrics', 'images']);

        return response()->json([
            'message' => 'Simulation updated successfully.',
            'data'    => new SimulationResource($simulation),
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
     * Delete a simulation.
     */
    public function destroy(Geometry $geometry, Simulation $simulation): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);

        $this->authorize('update', $geometry->cfdProject);

        $simulation->delete();

        return response()->json(['message' => 'Simulation deleted successfully.']);
    }

    /**
     * Delete a specific simulation image.
     */
    public function destroyImage(Geometry $geometry, Simulation $simulation, int $imageId): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);
        $this->authorize('update', $geometry->cfdProject);

        $image = $simulation->images()->findOrFail($imageId);
        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(['message' => 'Image deleted.']);
    }

    /**
     * Append metrics to an existing simulation (inline from detail page).
     */
    public function storeMetrics(Request $request, Geometry $geometry, Simulation $simulation): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);
        $this->authorize('update', $geometry->cfdProject);

        $request->validate([
            'metrics'         => ['required', 'array', 'min:1'],
            'metrics.*.key'   => ['required', 'string', 'max:100'],
            'metrics.*.value' => ['required', 'numeric'],
            'metrics.*.unit'  => ['nullable', 'string', 'max:50'],
        ]);

        $simulation->metrics()->createMany(
            array_map(fn($m) => [
                'key'   => $m['key'],
                'value' => $m['value'],
                'unit'  => $m['unit'] ?? null,
            ], $request->metrics)
        );

        $simulation->load(['metrics', 'images']);

        return response()->json([
            'message' => 'Metrics added.',
            'data'    => new SimulationResource($simulation),
        ]);
    }

    /**
     * Upload a single image to a simulation (inline from detail page).
     */
    public function storeImage(Request $request, Geometry $geometry, Simulation $simulation): JsonResponse
    {
        abort_if($simulation->geometry_id !== $geometry->id, 404);
        $this->authorize('update', $geometry->cfdProject);

        $request->validate([
            'image'   => ['required', 'file', 'image', 'max:5120'],
            'type'    => ['required', 'in:pressure,velocity,streamlines,mesh,residuals,temperature,other'],
            'caption' => ['nullable', 'string', 'max:255'],
            'order'   => ['nullable', 'integer'],
        ]);

        $path = $request->file('image')->store('simulations/images', 'public');
        $order = $simulation->images()->count();

        $simulation->images()->create([
            'path'    => $path,
            'type'    => $request->type,
            'caption' => $request->caption,
            'order'   => $request->input('order', $order),
        ]);

        $simulation->load(['metrics', 'images']);

        return response()->json([
            'message' => 'Image uploaded.',
            'data'    => new SimulationResource($simulation),
        ]);
    }

    /**
     * Helper: store uploaded images for a simulation.
     */
    private function storeImages(Request $request, Simulation $simulation): void
    {
        if (!$request->hasFile('images')) return;

        $types    = $request->input('image_types', []);
        $captions = $request->input('image_captions', []);
        $order    = $simulation->images()->count();

        foreach ($request->file('images') as $i => $file) {
            $path = $file->store('simulations/images', 'public');
            $simulation->images()->create([
                'path'    => $path,
                'type'    => $types[$i]    ?? 'other',
                'caption' => $captions[$i] ?? null,
                'order'   => $order + $i,
            ]);
        }
    }
}
