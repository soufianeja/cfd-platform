<?php



use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\CfdProject\CfdProjectController;
use App\Http\Controllers\Api\V1\Project\ProjectController;
use App\Http\Controllers\Api\V1\Geometry\GeometryController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public read-only
Route::get('/cfd-projects', [CfdProjectController::class, 'index']);
Route::get('/cfd-projects/mine', [CfdProjectController::class, 'mine'])->middleware('auth:sanctum');
Route::get('/cfd-projects/{slug}', [CfdProjectController::class, 'show']);
Route::get('/cfd-projects/{cfdProject}/geometries', [GeometryController::class, 'index']);

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/mine', [ProjectController::class, 'mine'])->middleware('auth:sanctum');
Route::get('/projects/{slug}', [ProjectController::class, 'show']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // CFD Projects
    Route::apiResource('cfd-projects', CfdProjectController::class)
        ->except(['index', 'show']);

    // Projects
    Route::apiResource('projects', ProjectController::class)
        ->except(['index', 'show']);

    // Geometries
    Route::post('/cfd-projects/{cfdProject}/geometries', [GeometryController::class, 'store']);
    Route::delete('/cfd-projects/{cfdProject}/geometries/{geometry}', [GeometryController::class, 'destroy']);

    // Social
    // Route::post('/comments',          [CommentController::class, 'store']);
    // Route::delete('/comments/{id}',   [CommentController::class, 'destroy']);
    // Route::post('/likes',             [LikeController::class, 'toggle']);
    // Route::post('/follow/{id}',       [FollowController::class, 'toggle']);

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