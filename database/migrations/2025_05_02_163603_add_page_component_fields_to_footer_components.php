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
        Schema::table('footer_components', function (Blueprint $table) {
            $table->foreignId('page_component_id')->nullable()->constrained('components')->nullOnDelete();
            $table->json('page_component_data')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('footer_components', function (Blueprint $table) {
            $table->foreignId('page_component_id')->nullable()->constrained('components')->nullOnDelete();
            $table->json('page_component_data')->nullable();
        });
    }
};
