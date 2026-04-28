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
        Schema::table('geometries', function (Blueprint $table) {
            $table->double('surface_area')->nullable();
            $table->double('volume')->nullable();
            $table->double('length')->nullable();
            $table->double('width')->nullable();
            $table->double('height')->nullable();
            $table->double('frontal_area')->nullable();
            $table->double('aspect_ratio')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('geometries', function (Blueprint $table) {
            $table->dropColumn([
                'surface_area', 'volume', 'length', 'width', 
                'height', 'frontal_area', 'aspect_ratio'
            ]);
        });
    }
};
