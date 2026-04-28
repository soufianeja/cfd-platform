<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Make reviewer_id nullable so pending reviews can be auto-created
     * before any reviewer claims them.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Drop existing FK constraint first
            $table->dropForeign(['reviewer_id']);
            // Re-add as nullable
            $table->unsignedBigInteger('reviewer_id')->nullable()->change();
            $table->foreign('reviewer_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['reviewer_id']);
            $table->unsignedBigInteger('reviewer_id')->nullable(false)->change();
            $table->foreign('reviewer_id')
                  ->references('id')
                  ->on('users')
                  ->cascadeOnDelete();
        });
    }
};
