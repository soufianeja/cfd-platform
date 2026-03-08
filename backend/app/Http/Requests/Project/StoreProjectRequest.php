<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Simplified for now, or use policies
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'project_type' => ['required', 'in:master,phd,paper,article'],
            'publication_year' => ['nullable', 'integer', 'min:1900', 'max:' . date('Y')],
            'external_link' => ['nullable', 'url', 'max:255'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['exists:tags,id'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['exists:categories,id'],
            'status' => ['required', 'in:draft,published,archived'],
        ];
    }
}
