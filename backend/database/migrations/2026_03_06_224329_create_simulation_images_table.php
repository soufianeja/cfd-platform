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
        Schema::create('simulation_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('simulation_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->enum('type', [
                'pressure', 'velocity', 'streamlines',
                'mesh', 'residuals', 'temperature', 'other'
            ]);
            $table->string('caption')->nullable();
            $table->unsignedTinyInteger('order')->default(0);
            $table->timestamps();

            $table->index('simulation_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('simulation_images');
    }
};
