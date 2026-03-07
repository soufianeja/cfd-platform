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
        Schema::create('geometries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cfd_project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('geometry_file'); // path to .stl / .step
            $table->enum('file_type', ['stl', 'step', 'iges', 'obj', 'other']);
            $table->string('preview_image')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamps();

            $table->index('cfd_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('geometries');
    }
};
