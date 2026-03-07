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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique(); // for SEO URLs /projects/my-project
            $table->text('description');
            $table->enum('project_type', ['master', 'phd', 'paper', 'article']);
            $table->year('publication_year')->nullable();
            $table->string('pdf_file')->nullable();
            $table->string('external_link')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->unsignedInteger('views_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            //Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('project_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
