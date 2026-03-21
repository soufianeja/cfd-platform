<?php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\CfdProject\CfdProjectResource;
use App\Http\Resources\Project\ProjectResource;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Get public profile and stats.
     */
    public function show(Request $request, User $user): UserResource
    {
        // Calculate total likes received across all CFD projects and Academic projects
        $totalLikes = $user->cfdProjects()->withCount('likes')->get()->sum('likes_count')
                    + $user->projects()->withCount('likes')->get()->sum('likes_count');

        $user->loadCount([
            'cfdProjects' => fn($q) => $q->published(),
            'projects' => fn($q) => $q->published(),
            'followers',
            'following'
        ]);

        $user->total_likes = $totalLikes;
        
        $user->is_following = false;
        if ($currentUser = $request->user('sanctum')) {
            $user->is_following = $currentUser->following()->where('following_id', $user->id)->exists();
        }

        return new UserResource($user);
    }

    /**
     * Get user's published CFD projects.
     */
    public function cfdProjects(User $user)
    {
        $projects = $user->cfdProjects()
            ->published()
            ->with(['categories', 'tags'])
            ->withCount(['geometries', 'likes'])
            ->latest()
            ->paginate(12);

        return CfdProjectResource::collection($projects);
    }

    /**
     * Get user's published academic projects.
     */
    public function projects(User $user)
    {
        $projects = $user->projects()
            ->published()
            ->with(['categories', 'tags'])
            ->withCount('likes')
            ->latest()
            ->paginate(12);

        return ProjectResource::collection($projects);
    }

    /**
     * Toggle follow/unfollow for a user.
     */
    public function follow(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself.'], 400);
        }

        $existing = $currentUser->following()->where('following_id', $user->id)->exists();

        if ($existing) {
            $currentUser->following()->detach($user->id);
            $following = false;
        } else {
            $currentUser->following()->attach($user->id);
            $following = true;
        }

        return response()->json([
            'following' => $following,
            'followers_count' => $user->followers()->count()
        ]);
    }
}
