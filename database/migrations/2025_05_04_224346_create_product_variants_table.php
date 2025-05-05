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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('sku')->nullable()->unique();
            $table->string('name')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->integer('inventory_quantity')->default(0);
            $table->string('inventory_policy')->default('deny');
            $table->string('inventory_management')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->string('barcode')->nullable();
            $table->decimal('weight', 10, 2)->nullable();
            $table->string('weight_unit')->nullable();
            $table->decimal('length', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->decimal('height', 10, 2)->nullable();
            $table->string('dimension_unit')->nullable();
            $table->json('options')->nullable();
	        $table->enum('display_type', [
		        'text',
		        'checkbox',
		        'date',
		        'file',
		        'multiline',
		        'multiple_choice',
		        'number',
		        'product_list',
		        'swatch'
	        ])->default('text');
	        $table->enum('display_style', ['dropdown', 'radio', 'buttons', 'swatches'])->default('dropdown');
	        $table->boolean('is_required')->default(false);
	        $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
