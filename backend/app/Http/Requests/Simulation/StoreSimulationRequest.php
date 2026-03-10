<?php

namespace App\Http\Requests\Simulation;

use Illuminate\Foundation\Http\FormRequest;

class StoreSimulationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'         => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'status'        => ['required', 'in:pending,running,completed,failed'],
            'metrics'       => ['nullable', 'array'],
            'metrics.*.key'   => ['required_with:metrics', 'string', 'max:100'],
            'metrics.*.value' => ['required_with:metrics', 'numeric'],
            'metrics.*.unit'  => ['nullable', 'string', 'max:50'],
        ];
    }
}
