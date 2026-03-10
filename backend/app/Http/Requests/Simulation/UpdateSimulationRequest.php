<?php

namespace App\Http\Requests\Simulation;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSimulationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'           => ['sometimes', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'status'          => ['sometimes', 'in:pending,running,completed,failed'],
            'metrics'         => ['nullable', 'array'],
            'metrics.*.key'   => ['required_with:metrics', 'string', 'max:100'],
            'metrics.*.value' => ['required_with:metrics', 'numeric'],
            'metrics.*.unit'  => ['nullable', 'string', 'max:50'],
            'images'          => ['nullable', 'array'],
            'images.*'        => ['file', 'image', 'max:5120'],
            'image_types'     => ['nullable', 'array'],
            'image_captions'  => ['nullable', 'array'],
        ];
    }
}
