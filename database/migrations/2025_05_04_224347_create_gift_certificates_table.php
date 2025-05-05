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
        Schema::create('gift_certificates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('set null'); // Purchaser
            $table->foreignId('recipient_id')->nullable()->constrained('users')->onDelete('set null'); // Recipient if registered
            
            // Certificate details
            $table->decimal('initial_amount', 10, 2);
            $table->decimal('current_balance', 10, 2);
            $table->string('recipient_name');
            $table->string('recipient_email');
            $table->string('sender_name')->nullable();
            $table->text('message')->nullable();
            
            // Validity and status
            $table->enum('status', ['active', 'used', 'expired', 'cancelled'])->default('active');
            $table->date('expiry_date')->nullable();
            $table->boolean('is_redeemed')->default(false);
            $table->timestamp('redeemed_at')->nullable();
            
            // Style and theme
            $table->string('theme')->nullable();
            
            // Order relation if purchased
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gift_certificates');
    }
};
