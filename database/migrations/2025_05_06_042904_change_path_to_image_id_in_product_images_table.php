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
        Schema::table('product_images', function (Blueprint $table) {
            // First check if the column exists
            if (Schema::hasColumn('product_images', 'url')) {
                // Add the new image_id column
                $table->unsignedBigInteger('image_id')->nullable()->after('product_id');
                
                // Add foreign key constraint to media table
                $table->foreign('image_id')->references('id')->on('media')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            if (Schema::hasColumn('product_images', 'image_id')) {
                // Drop the foreign key constraint
                $table->dropForeign(['image_id']);
                
                // Drop the column
                $table->dropColumn('image_id');
            }
        });
    }
};
