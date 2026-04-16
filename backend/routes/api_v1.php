<?php



use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\CfdProject\CfdProjectController;
use App\Http\Controllers\Api\V1\Project\ProjectController;
use App\Http\Controllers\Api\V1\Geometry\GeometryController;
use App\Http\Controllers\Api\V1\Simulation\SimulationController;
use App\Http\Controllers\Api\V1\Social\CommentController;
use App\Http\Controllers\Api\V1\Social\LikeController;
use App\Http\Controllers\Api\V1\User\UserController;
use App\Http\Controllers\Api\V1\Search\SearchController;

// Search
Route::get('/search', [SearchController::class, 'index']);

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public read-only
Route::get('/cfd-projects', [CfdProjectController::class, 'index']);
Route::get('/cfd-projects/mine', [CfdProjectController::class, 'mine'])->middleware('auth:sanctum');
Route::get('/cfd-projects/{slug}', [CfdProjectController::class, 'show']);
Route::get('/cfd-projects/{cfdProject}/geometries', [GeometryController::class, 'index']);
Route::get('/geometries', [GeometryController::class, 'all']);
Route::get('/comments', [CommentController::class, 'index']);

// Users (public read)
Route::get('/users/{user}', [UserController::class, 'show']);
Route::get('/users/{user}/cfd-projects', [UserController::class, 'cfdProjects']);
Route::get('/users/{user}/projects', [UserController::class, 'projects']);


// Simulations (public read)
Route::get('/geometries/{geometry}/simulations', [SimulationController::class, 'index']);
Route::get('/geometries/{geometry}/simulations/{simulation}', [SimulationController::class, 'show']);

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/mine', [ProjectController::class, 'mine'])->middleware('auth:sanctum');
Route::get('/projects/{slug}', [ProjectController::class, 'show']);
Route::get('/projects/{id}/pdf', [ProjectController::class, 'servePdf']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // CFD Projects
    Route::post('/cfd-projects', [CfdProjectController::class, 'store']);
    Route::put('/cfd-projects/{cfdProject}', [CfdProjectController::class, 'update']);
    Route::patch('/cfd-projects/{cfdProject}', [CfdProjectController::class, 'update']);
    Route::delete('/cfd-projects/{cfdProject}', [CfdProjectController::class, 'destroy']);

    // Projects
    Route::apiResource('projects', ProjectController::class)
        ->except(['index', 'show']);

    // Geometries
    Route::post('/cfd-projects/{cfdProject}/geometries', [GeometryController::class, 'store']);

    // Simulations (write)
    Route::post('/geometries/{geometry}/simulations', [SimulationController::class, 'store']);
    Route::post('/geometries/{geometry}/simulations/{simulation}', [SimulationController::class, 'update']);
    Route::delete('/geometries/{geometry}/simulations/{simulation}', [SimulationController::class, 'destroy']);
    Route::post('/geometries/{geometry}/simulations/{simulation}/metrics', [SimulationController::class, 'storeMetrics']);
    Route::post('/geometries/{geometry}/simulations/{simulation}/images', [SimulationController::class, 'storeImage']);
    Route::delete('/geometries/{geometry}/simulations/{simulation}/images/{imageId}', [SimulationController::class, 'destroyImage']);
    Route::delete('/cfd-projects/{cfdProject}/geometries/{geometry}', [GeometryController::class, 'destroy']);

    // Social
    Route::post('/comments',             [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('/likes',                [LikeController::class, 'toggle']);
    Route::post('/users/{user}/follow',  [UserController::class, 'follow']);

    // // Admin only
    // Route::middleware('role:admin')->prefix('admin')->group(function () {
    //     Route::get('/users',           [UserController::class, 'index']);
    //     Route::patch('/users/{id}/ban', [UserController::class, 'ban']);
    // });

    // // Reviewer only
    // Route::middleware('role:reviewer')->prefix('reviews')->group(function () {
    //     Route::get('/',                [ReviewController::class, 'index']);
    //     Route::patch('/{id}',          [ReviewController::class, 'update']);
    // });
});