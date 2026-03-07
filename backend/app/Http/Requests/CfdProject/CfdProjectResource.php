<?php

namespace App\Http\Resources\CfdProject;

use Illuminate\Http\Resources\Json\JsonResource;

class CfdProjectResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'slug'             => $this->slug,
            'description'      => $this->description,
            'software'         => $this->software,
            'solver'           => $this->solver,
            'mesh_cells'       => $this->mesh_cells,
            'reynolds_number'  => $this->reynolds_number,
            'turbulence_model' => $this->turbulence_model,
            'simulation_type'  => $this->simulation_type,
            'results_summary'  => $this->results_summary,
            'status'           => $this->status,
            'views_count'      => $this->views_count,
            'created_at'       => $this->created_at->toDateString(),

            // Relationships — only loaded when available (no N+1)
            'user'       => new UserResource($this->whenLoaded('user')),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'tags'       => TagResource::collection($this->whenLoaded('tags')),
            'simulations'=> SimulationResource::collection($this->whenLoaded('simulations')),
        ];
    }
}