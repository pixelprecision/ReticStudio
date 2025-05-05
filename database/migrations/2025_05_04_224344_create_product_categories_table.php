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
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('image')->nullable();
            $table->string('template_layout')->default('default');
            $table->integer('sort_order')->default(0);
            $table->string('default_product_sort')->default('featured');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_visible')->default(true);
            // SEO fields
            $table->string('seo_title')->nullable();
            $table->string('seo_keywords')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });
        
        // Add foreign key constraint after table creation
        Schema::table('product_categories', function (Blueprint $table) {
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('product_categories')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};
