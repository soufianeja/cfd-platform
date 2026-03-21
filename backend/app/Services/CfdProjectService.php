<?php

namespace App\Services;

use App\Models\CfdProject;
use App\Models\User;
use App\Repositories\Interfaces\CfdProjectRepositoryInterface;
use Illuminate\Support\Str;
use Illuminate\Auth\Access\AuthorizationException;

class CfdProjectService
{
    public function __construct(
        private CfdProjectRepositoryInterface $repository
    ) {
    }

    public function getAll(array $filters)
    {
        return $this->repository->getAllPublished($filters);
    }

    public function getBySlug(string $slug)
    {
        $project = $this->repository->findBySlug($slug);

        if ($project->status === 'published') {
            // Increment view count (business logic — belongs in service)
            $this->repository->update($project, [
                'views_count' => $project->views_count + 1
            ]);
        }

        return $project;
    }

    public function create(User $user, array $data): CfdProject
    {
        $data['user_id'] = $user->id;
        $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);

        $project = $this->repository->create($data);

        // Sync tags and categories if provided
        if (isset($data['tag_ids'])) {
            $project->tags()->sync($data['tag_ids']);
        }

        if (isset($data['category_ids'])) {
            $project->categories()->sync($data['category_ids']);
        }

        return $project;
    }

    // public function update(User $user, CfdProject $project, array $data): CfdProject
    // {
    //     // Authorization check — belongs in service, not controller
    //     if ($user->id !== $project->user_id && !$user->hasRole('admin')) {
    //         throw new AuthorizationException('You do not own this project.');
    //     }

    //     if (isset($data['title'])) {
    //         $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);
    //     }

    //     $project = $this->repository->update($project, $data);

    //     if (isset($data['tag_ids'])) {
    //         $project->tags()->sync($data['tag_ids']);
    //     }

    //     if (isset($data['category_ids'])) {
    //         $project->categories()->sync($data['category_ids']);
    //     }

    //     return $project;
    // }

    // public function delete(User $user, CfdProject $project): void
    // {
    //     if ($user->id !== $project->user_id && !$user->hasRole('admin')) {
    //         throw new AuthorizationException('You do not own this project.');
    //     }

    //     $this->repository->delete($project);
    // }

    public function update(CfdProject $cfdProject, array $data): CfdProject
    {
        return $this->repository->update($cfdProject, $data);
    }

    public function delete(CfdProject $cfdProject): void
    {
        $this->repository->delete($cfdProject);
    }
}