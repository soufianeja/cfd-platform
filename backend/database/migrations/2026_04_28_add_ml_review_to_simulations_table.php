<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('simulations', function (Blueprint $table) {
            $table->enum('ml_review_status', ['pending', 'approved', 'rejected'])
                  ->default('pending')
                  ->after('status');
            $table->timestamp('ml_validated_at')->nullable()->after('ml_review_status');
        });
    }

    public function down(): void
    {
        Schema::table('simulations', function (Blueprint $table) {
            $table->dropColumn(['ml_review_status', 'ml_validated_at']);
        });
    }
};
