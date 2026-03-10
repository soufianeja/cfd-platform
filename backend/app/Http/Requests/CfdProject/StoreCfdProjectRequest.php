<?php

namespace App\Http\Requests\CfdProject;

use Illuminate\Foundation\Http\FormRequest;

class StoreCfdProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authentication check only — ownership is enforced by the Policy in the controller
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['required', 'string'],
            'software'         => ['required', 'in:OpenFOAM,ANSYS Fluent,STAR-CCM+,SU2,COMSOL,Other'],
            'solver'           => ['nullable', 'string', 'max:100'],
            'mesh_cells'       => ['nullable', 'integer', 'min:0'],
            'reynolds_number'  => ['nullable', 'numeric'],
            'turbulence_model' => ['nullable', 'string', 'max:100'],
            'simulation_type'  => ['required', 'in:external,internal,heat_transfer,multiphase,turbomachinery,combustion,acoustics,other'],
            'results_summary'  => ['nullable', 'string'],
            'tag_ids'          => ['nullable', 'array'],
            'tag_ids.*'        => ['exists:tags,id'],
            'category_ids'     => ['nullable', 'array'],
            'category_ids.*'   => ['exists:categories,id'],
            'status'           => ['required', 'in:draft,published'],
        ];
    }
}