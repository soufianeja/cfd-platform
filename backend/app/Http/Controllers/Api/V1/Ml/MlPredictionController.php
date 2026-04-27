<?php

namespace App\Http\Controllers\Api\V1\Ml;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MlPredictionController extends Controller
{
    public function predict(Request $request)
    {
        $validated = $request->validate([
            'geometry_type' => 'required|string',
            'surface_area'  => 'required|numeric|min:0',
            'volume'        => 'required|numeric|min:0',
            'length'        => 'required|numeric|min:0',
            'width'         => 'required|numeric|min:0',
            'height'        => 'required|numeric|min:0',
            'frontal_area'  => 'required|numeric|min:0',
            'velocity'      => 'required|numeric|min:0',
            'reynolds'      => 'required|numeric|min:0',
            'rear_wing_angle' => 'nullable|numeric',
            'slant_angle'     => 'nullable|numeric',
        ]);

        $response = Http::timeout(10)->post(
            config('services.ml.url') . '/api/v1/predictions/',
            $validated
        );

        if ($response->failed()) {
            return response()->json(['error' => 'ML Service unavailable'], 503);
        }

        return response()->json($response->json());
    }

    public function extract(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }

        $response = Http::timeout(10)->attach(
            'file', file_get_contents($request->file('file')->path()), $request->file('file')->getClientOriginalName()
        )->post(config('services.ml.url') . '/api/v1/features/extract');

        if ($response->failed()) {
            return response()->json(['error' => 'ML Service unavailable'], 503);
        }

        return response()->json($response->json());
    }

    public function trainingStatus()
    {
        $response = Http::timeout(5)->get(
            config('services.ml.url') . '/api/v1/training/status'
        );

        if ($response->failed()) {
            return response()->json(['error' => 'ML Service unavailable'], 503);
        }

        return response()->json($response->json());
    }
}
