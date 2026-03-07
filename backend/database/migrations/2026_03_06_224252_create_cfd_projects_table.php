<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cfd_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->enum('software', ['OpenFOAM', 'Fluent', 'StarCCM+', 'SU2', 'Other']);
            $table->string('solver')->nullable();
            $table->unsignedBigInteger('mesh_cells')->nullable();
            $table->float('reynolds_number')->nullable();
            $table->string('turbulence_model')->nullable(); // k-epsilon, k-omega, LES, DNS
            $table->enum('simulation_type', [
                'external_aero', 'internal_flow',
                'heat_transfer', 'multiphase', 'turbomachinery', 'other'
            ]);
            $table->text('results_summary')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('status');
            $table->index('simulation_type');
            $table->index('software');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cfd_projects');
    }
};
