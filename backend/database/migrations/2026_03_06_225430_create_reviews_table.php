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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reviewer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->morphs('reviewable'); // works on projects + cfd_projects
            $table->enum('status', ['pending', 'approved', 'rejected', 'revision_requested']);
            $table->text('feedback')->nullable(); // reviewer's notes
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['reviewable_id', 'reviewable_type']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
