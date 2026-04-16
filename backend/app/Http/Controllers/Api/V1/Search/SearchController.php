<?php

namespace App\Http\Controllers\Api\V1\Search;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\SearchRequest;
use App\Services\V1\SearchService;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    protected SearchService $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    public function index(SearchRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $query = $validated['q'];
        $type = $validated['type'] ?? 'all';

        $results = $this->searchService->search($query, $type);

        return response()->json([
            'data' => $results,
            'query' => $query,
        ]);
    }
}
