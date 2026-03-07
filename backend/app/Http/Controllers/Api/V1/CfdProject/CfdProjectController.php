<?php

namespace App\Http\Controllers\Api\V1\CfdProject;

use App\Http\Controllers\Controller;
use App\Http\Requests\CfdProject\StoreCfdProjectRequest;
use App\Http\Requests\CfdProject\UpdateCfdProjectRequest;
use App\Http\Resources\CfdProject\CfdProjectResource;
use App\Models\CfdProject;
use App\Services\CfdProjectService;
use Illuminate\Http\Request;

class CfdProjectController extends Controller
{
    public function __construct(
        private CfdProjectService $service
    ) {}

    public function index(Request $request)
    {
        $projects = $this->service->getAll($request->only([
            'software', 'simulation_type', 'search'
        ]));

        return CfdProjectResource::collection($projects);
    }

    public function show(string $slug)
    {
        $project = $this->service->getBySlug($slug);
        return new CfdProjectResource($project);
    }

    public function store(StoreCfdProjectRequest $request)
    {
        $project = $this->service->create(
            $request->user(),
            $request->validated()
        );

        return new CfdProjectResource($project);
    }

    public function update(UpdateCfdProjectRequest $request, CfdProject $project)
    {
        $project = $this->service->update(
            $request->user(),
            $project,
            $request->validated()
        );

        return new CfdProjectResource($project);
    }

    public function destroy(Request $request, CfdProject $project)
    {
        $this->service->delete($request->user(), $project);
        return response()->json(['message' => 'Deleted successfully'], 200);
    }
}