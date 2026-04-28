<?php

namespace App\Http\Controllers\Api\V1\Review;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Simulation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ReviewController extends Controller
{
    /**
     * List all simulations pending ML review.
     * Includes geometry features + metrics (cd, cl).
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');

        $simulations = Simulation::with([
                'geometry.cfdProject',
                'metrics',
                'images',
            ])
            ->where('ml_review_status', $status)
            ->latest()
            ->paginate(15);

        $data = $simulations->map(function ($sim) {
            $cd = $sim->getMetric('cd');
            $cl = $sim->getMetric('cl');

            return [
                'id'               => $sim->id,
                'title'            => $sim->title,
                'description'      => $sim->description,
                'status'           => $sim->status,
                'ml_review_status' => $sim->ml_review_status,
                'ml_validated_at'  => $sim->ml_validated_at,
                'parameters'       => $sim->parameters,
                'created_at'       => $sim->created_at,
                'geometry'         => [
                    'id'           => $sim->geometry?->id,
                    'name'         => $sim->geometry?->name,
                    'preview_image'=> $sim->geometry?->preview_image,
                    'features'     => $sim->geometry?->features,
                    'cfd_project'  => [
                        'title' => $sim->geometry?->cfdProject?->title,
                        'slug'  => $sim->geometry?->cfdProject?->slug,
                        'type'  => $sim->geometry?->cfdProject?->type,
                    ],
                ],
                'metrics'          => $sim->metrics->map(fn($m) => [
                    'key'   => $m->key,
                    'value' => $m->value,
                    'unit'  => $m->unit,
                ]),
                'cd'               => $cd,
                'cl'               => $cl,
                'thumbnail'        => $sim->images->first()?->path,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $simulations->currentPage(),
                'last_page'    => $simulations->lastPage(),
                'total'        => $simulations->total(),
                'status_filter'=> $status,
            ],
            'counts' => [
                'pending'  => Simulation::where('ml_review_status', 'pending')->count(),
                'approved' => Simulation::where('ml_review_status', 'approved')->count(),
                'rejected' => Simulation::where('ml_review_status', 'rejected')->count(),
            ],
        ]);
    }

    /**
     * Approve a simulation: mark as approved, create review record,
     * then append the data to the ML dataset.
     */
    public function approve(Request $request, Simulation $simulation): JsonResponse
    {
        if ($simulation->ml_review_status === 'approved') {
            return response()->json(['message' => 'Simulation is already approved.'], 422);
        }

        $request->validate([
            'feedback' => ['nullable', 'string', 'max:2000'],
        ]);

        $simulation->load(['geometry.cfdProject', 'metrics']);

        $cd = $simulation->getMetric('cd');
        $cl = $simulation->getMetric('cl');

        if ($cd === null || $cl === null) {
            return response()->json([
                'message' => 'Cannot approve: simulation is missing cd (drag) or cl (lift) metrics.'
            ], 422);
        }

        // Update simulation review status
        $simulation->update([
            'ml_review_status' => 'approved',
            'ml_validated_at'  => now(),
        ]);

        // Create review record
        Review::updateOrCreate(
            [
                'reviewable_id'   => $simulation->id,
                'reviewable_type' => Simulation::class,
            ],
            [
                'reviewer_id' => $request->user()->id,
                'status'      => 'approved',
                'feedback'    => $request->input('feedback'),
                'reviewed_at' => now(),
            ]
        );

        // Append to ML dataset
        $simParams = is_array($simulation->parameters) ? $simulation->parameters : [];

        // Extract specific physical metrics if they exist
        $velocity = $simulation->getMetric('velocity') ?? $simulation->getMetric('inlet_velocity');
        $reynolds = $simulation->getMetric('reynolds');
        $rearWing = $simulation->getMetric('rear_wing_angle') ?? $simulation->getMetric('rear_wing');
        $slant = $simulation->getMetric('slant_angle') ?? $simulation->getMetric('slant');

        if ($velocity !== null) $simParams['velocity'] = $velocity;
        if ($reynolds !== null) $simParams['reynolds'] = $reynolds;
        if ($rearWing !== null) $simParams['rear_wing_angle'] = $rearWing;
        if ($slant !== null) $simParams['slant_angle'] = $slant;

        if (empty($simParams)) {
            $simParams = new \stdClass(); // ensures JSON encodes as {} not []
        }

        $mlResponse = Http::withHeaders([
            'X-API-Key' => config('services.ml.key'),
        ])->timeout(15)->post(config('services.ml.url') . '/api/v1/dataset/append', [
            'geometry_type'     => $simulation->geometry?->cfdProject?->type ?? 'other',
            'geometry_features' => $simulation->geometry?->features ?? [],
            'simulation_params' => $simParams,
            'drag_coefficient'  => $cd,
            'lift_coefficient'  => $cl,
        ]);

        $mlData = $mlResponse->successful() ? $mlResponse->json() : null;

        return response()->json([
            'message'             => 'Simulation approved and appended to ML dataset.',
            'ml_review_status'    => 'approved',
            'ml_validated_at'     => $simulation->ml_validated_at,
            'dataset_size'        => $mlData['dataset_size'] ?? null,
            'retraining_triggered'=> $mlData['retraining_triggered'] ?? false,
        ]);
    }

    /**
     * Reject a simulation with mandatory feedback.
     */
    public function reject(Request $request, Simulation $simulation): JsonResponse
    {
        $request->validate([
            'feedback' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $simulation->update([
            'ml_review_status' => 'rejected',
        ]);

        Review::updateOrCreate(
            [
                'reviewable_id'   => $simulation->id,
                'reviewable_type' => Simulation::class,
            ],
            [
                'reviewer_id' => $request->user()->id,
                'status'      => 'rejected',
                'feedback'    => $request->input('feedback'),
                'reviewed_at' => now(),
            ]
        );

        return response()->json([
            'message'          => 'Simulation rejected.',
            'ml_review_status' => 'rejected',
        ]);
    }
}
