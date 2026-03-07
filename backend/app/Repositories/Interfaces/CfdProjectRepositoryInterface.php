<?php

namespace App\Repositories\Interfaces;

use App\Models\CfdProject;
use Illuminate\Pagination\LengthAwarePaginator;

interface CfdProjectRepositoryInterface
{
    public function getAllPublished(array $filters): LengthAwarePaginator;
    public function findBySlug(string $slug): ?CfdProject;
    public function create(array $data): CfdProject;
    public function update(CfdProject $project, array $data): CfdProject;
    public function delete(CfdProject $project): void;
}