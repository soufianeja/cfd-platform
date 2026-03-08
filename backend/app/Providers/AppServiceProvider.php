<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\CfdProjectRepositoryInterface;
use App\Repositories\CfdProjectRepository;
use App\Models\CfdProject;
use App\Policies\CfdProjectPolicy;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(CfdProject::class, CfdProjectPolicy::class);

    }
}
