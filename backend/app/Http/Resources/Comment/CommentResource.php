<?php

namespace App\Http\Resources\Comment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'content'    => $this->content,
            'parent_id'  => $this->parent_id,
            'created_at' => $this->created_at?->diffForHumans(),
            'author'     => [
                'id'     => $this->user->id,
                'name'   => $this->user->name,
                'avatar' => $this->user->avatar ?? null,
            ],
            'replies'    => CommentResource::collection($this->whenLoaded('replies')),
        ];
    }
}
