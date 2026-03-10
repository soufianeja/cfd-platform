<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\CfdProjectRepositoryInterface;
use App\Repositories\CfdProjectRepository;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use App\Repositories\ProjectRepository;
use App\Models\CfdProject;
use App\Models\Geometry;
use App\Models\Project;
use App\Models\Simulation;
use App\Policies\CfdProjectPolicy;
use App\Policies\GeometryPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\SimulationPolicy;
use App\Repositories\Interfaces\GeometryRepositoryInterface;
use App\Repositories\GeometryRepository;
use App\Repositories\Interfaces\SimulationRepositoryInterface;
use App\Repositories\SimulationRepository;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            CfdProjectRepositoryInterface::class,
            CfdProjectRepository::class
        );
        $this->app->bind(
            ProjectRepositoryInterface::class,
            ProjectRepository::class
        );
        $this->app->bind(
            GeometryRepositoryInterface::class,
            GeometryRepository::class
        );
        $this->app->bind(
            SimulationRepositoryInterface::class,
            SimulationRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(CfdProject::class, CfdProjectPolicy::class);
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Geometry::class, GeometryPolicy::class);
        Gate::policy(Simulation::class, SimulationPolicy::class);

    }
}
