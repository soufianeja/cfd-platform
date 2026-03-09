<?php

namespace App\Http\Resources\Geometry;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GeometryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'file_size_mb' => $this->file_size ? round($this->file_size / 1048576, 2) . ' MB' : null,
            'geometry_file' => $this->geometry_file ? \Illuminate\Support\Facades\Storage::url($this->geometry_file) : null,
            'preview_image' => $this->preview_image ? \Illuminate\Support\Facades\Storage::url($this->preview_image) : null,
            'created_at' => $this->created_at?->toDateTimeString(),
            'project' => $this->whenLoaded('cfdProject', fn() => [
                'id' => $this->cfdProject->id,
                'slug' => $this->cfdProject->slug,
                'title' => $this->cfdProject->title,
            ]),
        ];
    }
}
