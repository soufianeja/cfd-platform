<?php

namespace App\Http\Controllers\Api\V1\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Resources\Comment\CommentResource;
use App\Models\Comment;
use App\Models\CfdProject;
use App\Models\Project;
use App\Models\Simulation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    private function resolveCommentable(string $type, int $id)
    {
        return match($type) {
            'cfd_project' => CfdProject::findOrFail($id),
            'project'     => Project::findOrFail($id),
            'simulation'  => Simulation::findOrFail($id),
        };
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'commentable_type' => ['required', 'in:cfd_project,project,simulation'],
            'commentable_id'   => ['required', 'integer'],
        ]);

        $commentable = $this->resolveCommentable(
            $request->commentable_type,
            $request->commentable_id
        );

        $comments = $commentable->comments()
            ->with(['user', 'replies.user'])
            ->whereNull('parent_id')
            ->latest()
            ->get();

        return response()->json([
            'data' => CommentResource::collection($comments),
        ]);
    }

    public function store(StoreCommentRequest $request): JsonResponse
    {
        $commentable = $this->resolveCommentable(
            $request->commentable_type,
            $request->commentable_id
        );

        $comment = $commentable->comments()->create([
            'user_id'   => $request->user()->id,
            'content'   => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        $comment->load('user');

        return response()->json([
            'message' => 'Comment added.',
            'data'    => new CommentResource($comment),
        ], 201);
    }

    public function destroy(Comment $comment, Request $request): JsonResponse
    {
        if ($comment->user_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }
}
