<?php

namespace App\Http\Requests\Geometry;

use Illuminate\Foundation\Http\FormRequest;

class StoreGeometryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'geometry_file' => [
                'required',
                'file',
                'extensions:glb,stl,obj,step,stp,iges,igs',
                'max:51200'],        
            'preview_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
