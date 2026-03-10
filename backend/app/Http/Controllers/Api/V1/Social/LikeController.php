<?php

namespace App\Http\Controllers\Api\V1\Social;

use App\Http\Controllers\Controller;
use App\Models\CfdProject;
use App\Models\Project;
use App\Models\Simulation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    private function resolveLikeable(string $type, int $id)
    {
        return match($type) {
            'cfd_project' => CfdProject::findOrFail($id),
            'project'     => Project::findOrFail($id),
            'simulation'  => Simulation::findOrFail($id),
        };
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'likeable_type' => ['required', 'in:cfd_project,project,simulation'],
            'likeable_id'   => ['required', 'integer'],
        ]);

        $likeable = $this->resolveLikeable(
            $request->likeable_type,
            $request->likeable_id
        );

        $existing = $likeable->likes()
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            $likeable->likes()->create(['user_id' => $request->user()->id]);
            $liked = true;
        }

        return response()->json([
            'liked'       => $liked,
            'likes_count' => $likeable->likes()->count(),
        ]);
    }
}
