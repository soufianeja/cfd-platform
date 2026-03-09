<?php

namespace App\Http\Controllers\Api\V1\Project;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Resources\Project\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProjectController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private ProjectService $service
    ) {
    }

    public function index(Request $request)
    {
        $projects = $this->service->getAll($request->only([
            'project_type',
            'search'
        ]));

        return ProjectResource::collection($projects);
    }

    public function show(Request $request, string $slug)
    {
        $project = $this->service->getBySlug($slug);

        if ($project->status !== 'published') {
            $user = $request->user('sanctum');
            if (!$user || ($user->id !== $project->user_id && !$user->hasRole('admin'))) {
                abort(404);
            }
        }

        return new ProjectResource($project);
    }

    public function store(StoreProjectRequest $request)
    {
        $project = $this->service->create(
            $request->user(),
            $request->validated(),
            $request->file('pdf_file')

        );

         return response()->json([
        'message' => 'Project created successfully.',
        'data'    => new ProjectResource($project),
    ], 201);
    }

    public function mine(Request $request)
    {
        $projects = Project::where('user_id', $request->user()->id)
            ->with(['categories', 'tags'])
            ->latest()
            ->paginate(12);

        return ProjectResource::collection($projects);
    }

    public function update(StoreProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);
        $updatedProject = $this->service->update($project, $request->validated());

        return response()->json([
            'message' => 'Project updated successfully.',
            'data' => new ProjectResource($updatedProject),
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);
        $this->service->delete($project);

        return response()->json(['message' => 'Project deleted successfully.']);
    }
}
