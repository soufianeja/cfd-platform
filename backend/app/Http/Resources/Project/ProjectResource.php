<?php

namespace App\Http\Resources\Project;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user'),
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'project_type' => $this->project_type,
            'publication_year' => $this->publication_year,
            'pdf_file' => $this->pdf_file,
            'external_link' => $this->external_link,
            'status' => $this->status,
            'views_count' => $this->views_count,
            'categories' => $this->whenLoaded('categories'),
            'tags' => $this->whenLoaded('tags'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
