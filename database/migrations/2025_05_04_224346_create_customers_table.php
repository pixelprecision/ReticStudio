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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Customer details
            $table->string('customer_number')->nullable()->unique();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable();
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('tax_id')->nullable();
            
            // Customer classification
            $table->string('customer_group')->nullable();
            $table->decimal('store_credit', 10, 2)->default(0);
            $table->boolean('accepts_marketing')->default(false);
            $table->timestamp('last_login_at')->nullable();
            $table->string('notes')->nullable();
            
            // Default addresses will be stored in a separate table
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
