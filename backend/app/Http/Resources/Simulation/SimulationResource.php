<?php

namespace App\Http\Resources\Simulation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SimulationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'geometry_id' => $this->geometry_id,
            'title'       => $this->title,
            'description' => $this->description,
            'status'      => $this->status,
            'video_result'=> $this->video_result,
            'metrics'     => $this->whenLoaded('metrics', fn() =>
                $this->metrics->map(fn($m) => [
                    'id'    => $m->id,
                    'key'   => $m->key,
                    'value' => $m->value,
                    'unit'  => $m->unit,
                ])
            ),
            'images'      => $this->whenLoaded('images', fn() =>
                $this->images->map(fn($img) => [
                    'id'      => $img->id,
                    'path'    => $img->path,
                    'type'    => $img->type,
                    'caption' => $img->caption,
                    'order'   => $img->order,
                ])
            ),
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
