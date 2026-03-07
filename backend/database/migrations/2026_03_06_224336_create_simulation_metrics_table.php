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
        Schema::create('simulation_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('simulation_id')->constrained()->cascadeOnDelete();
            $table->string('key');   // 'Cd', 'Cl', 'pressure_drop', 'Nu'
            $table->float('value');
            $table->string('unit')->nullable(); // 'Pa', 'N', '-'
            $table->timestamps();

            $table->index('simulation_id');        
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('simulation_metrics');
    }
};
