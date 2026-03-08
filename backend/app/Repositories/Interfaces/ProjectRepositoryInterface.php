<?php

namespace App\Repositories\Interfaces;

use App\Models\Project;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProjectRepositoryInterface
{
    public function getAllPublished(array $filters): LengthAwarePaginator;
    public function findBySlug(string $slug): ?Project;
    public function create(array $data): Project;
    public function update(Project $project, array $data): Project;
    public function delete(Project $project): void;
}