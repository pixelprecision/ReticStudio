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
        if (Schema::hasTable('customers')) {
            Schema::table('customers', function (Blueprint $table) {
                // Add missing columns from Customer model
                if (!Schema::hasColumn('customers', 'first_name')) {
                    $table->string('first_name')->nullable();
                }
                
                if (!Schema::hasColumn('customers', 'last_name')) {
                    $table->string('last_name')->nullable();
                }
                
                if (!Schema::hasColumn('customers', 'email')) {
                    $table->string('email')->nullable();
                }
                
                if (!Schema::hasColumn('customers', 'default_address_id')) {
                    $table->unsignedBigInteger('default_address_id')->nullable();
                }
                
                if (!Schema::hasColumn('customers', 'last_order_date')) {
                    $table->timestamp('last_order_date')->nullable();
                }
                
                if (!Schema::hasColumn('customers', 'total_spent')) {
                    $table->decimal('total_spent', 10, 2)->default(0);
                }
                
                if (!Schema::hasColumn('customers', 'total_orders')) {
                    $table->integer('total_orders')->default(0);
                }
                
                if (!Schema::hasColumn('customers', 'tags')) {
                    $table->text('tags')->nullable();
                }
                
                if (!Schema::hasColumn('customers', 'tax_exempt')) {
                    $table->boolean('tax_exempt')->default(false);
                }
                
                // Add soft deletes if it doesn't exist
                if (!Schema::hasColumn('customers', 'deleted_at')) {
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
        if (Schema::hasTable('customers')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->dropColumn([
                    'first_name',
                    'last_name',
                    'email',
                    'default_address_id',
                    'last_order_date',
                    'total_spent',
                    'total_orders',
                    'tags',
                    'tax_exempt',
                    'deleted_at'
                ]);
            });
        }
    }
};