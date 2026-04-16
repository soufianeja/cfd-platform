<?php

namespace App\Services\V1;

use App\Repositories\V1\SearchRepository;

class SearchService
{
    protected SearchRepository $searchRepository;

    public function __construct(SearchRepository $searchRepository)
    {
        $this->searchRepository = $searchRepository;
    }

    public function search(string $query, ?string $type = 'all')
    {
        $type = $type ?? 'all';
        $results = [
            'cfd_projects' => [],
            'projects' => [],
            'users' => [],
            'tags' => [],
        ];

        if ($type === 'all' || $type === 'cfd_projects') {
            $results['cfd_projects'] = $this->searchRepository->searchCfdProjects($query);
        }

        if ($type === 'all' || $type === 'projects') {
            $results['projects'] = $this->searchRepository->searchProjects($query);
        }

        if ($type === 'all' || $type === 'users') {
            $results['users'] = $this->searchRepository->searchUsers($query);
        }

        if ($type === 'all' || $type === 'tags') {
            $results['tags'] = $this->searchRepository->searchTags($query);
        }

        return $results;
    }
}
