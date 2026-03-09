<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use Illuminate\Support\Str;

class ProjectService
{
    public function __construct(
        private ProjectRepositoryInterface $repository
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
            $this->repository->update($project, [
                'views_count' => $project->views_count + 1
            ]);
        }

        return $project;
    }

    public function create(User $user, array $data, $file = null): Project
    {
        $data['user_id'] = $user->id;
        $data['slug']    = Str::slug($data['title']) . '-' . Str::random(6);
        $data['status']  = $data['status'] ?? 'draft';

        // 👇 Ajout du PDF
        if ($file) {
            $data['pdf_file'] = $file->store('projects/pdfs', 'public');
        }

        $project = $this->repository->create($data);

        if (isset($data['tag_ids'])) {
            $project->tags()->sync($data['tag_ids']);
        }

        if (isset($data['category_ids'])) {
            $project->categories()->sync($data['category_ids']);
        }

        return $project;
    }                                                   

    public function update(Project $project, array $data): Project
    {
        if (isset($data['title']) && $data['title'] !== $project->title) {
            $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);
        }

        $project = $this->repository->update($project, $data);

        if (isset($data['tag_ids'])) {
            $project->tags()->sync($data['tag_ids']);
        }

        if (isset($data['category_ids'])) {
            $project->categories()->sync($data['category_ids']);
        }

        return $project;
    }

    public function delete(Project $project): void
    {
        $this->repository->delete($project);
    }
}
