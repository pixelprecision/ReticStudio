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
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('reviewer_name');
            $table->string('reviewer_email')->nullable();
            $table->string('title')->nullable();
            $table->text('content');
            $table->integer('rating')->default(5); // 1-5 stars
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_verified_purchase')->default(false);
            $table->unsignedBigInteger('order_id')->nullable(); 
            $table->timestamps();
        });
        
        // Add foreign key constraint now that orders table exists
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->foreign('order_id')
                  ->references('id')
                  ->on('orders')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
