<?php

namespace App\Http\Requests\Comment;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'content'          => ['required', 'string', 'max:2000'],
            'commentable_type' => ['required', 'in:cfd_project,project,simulation'],
            'commentable_id'   => ['required', 'integer'],
            'parent_id'        => ['nullable', 'exists:comments,id'],
        ];
    }
}
