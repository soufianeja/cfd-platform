<?php

namespace App\Http\Resources\CfdProject;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CfdProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,

            'software' => $this->software,
            'simulation_type' => $this->simulation_type,
            'views_count' => $this->views_count,
            'status' => $this->status,
            'solver' => $this->solver,
            'mesh_cells' => $this->mesh_cells,
            'reynolds_number' => $this->reynolds_number,
            'turbulence_model' => $this->turbulence_model,

            'author' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ],

            'created_at' => $this->created_at,
        ];
    }
}