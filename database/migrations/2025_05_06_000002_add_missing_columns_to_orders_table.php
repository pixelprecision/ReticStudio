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
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                // Add missing columns from Order model
                if (!Schema::hasColumn('orders', 'billing_address')) {
                    $table->string('billing_address')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'billing_city')) {
                    $table->string('billing_city')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'billing_state')) {
                    $table->string('billing_state')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'billing_zip')) {
                    $table->string('billing_zip')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'billing_country')) {
                    $table->string('billing_country')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'shipping_name')) {
                    $table->string('shipping_name')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'shipping_email')) {
                    $table->string('shipping_email')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'shipping_phone')) {
                    $table->string('shipping_phone')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'shipping_address')) {
                    $table->string('shipping_address')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'shipping_city')) {
                    $table->string('shipping_city')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'shipping_state')) {
                    $table->string('shipping_state')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'shipping_zip')) {
                    $table->string('shipping_zip')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'shipping_country')) {
                    $table->string('shipping_country')->nullable();
                }
                
                if (!Schema::hasColumn('orders', 'coupon_code')) {
                    $table->string('coupon_code')->nullable();
                }
                
                // Add soft deletes if it doesn't exist
                if (!Schema::hasColumn('orders', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn([
                    'billing_address',
                    'billing_city',
                    'billing_state',
                    'billing_zip',
                    'billing_country',
                    'shipping_name',
                    'shipping_email',
                    'shipping_phone',
                    'shipping_address',
                    'shipping_city',
                    'shipping_state',
                    'shipping_zip',
                    'shipping_country',
                    'coupon_code',
                    'deleted_at'
                ]);
            });
        }
    }
};