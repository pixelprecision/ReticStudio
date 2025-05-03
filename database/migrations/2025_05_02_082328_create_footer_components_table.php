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
        Schema::create('footer_components', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // logo, menu, text, social, contact, copyright, component
            $table->string('position'); // footer, footer_bar, column_1, column_2, column_3, etc.
            $table->integer('column')->nullable(); // For column-based positioning
            $table->integer('order')->default(0);
            $table->foreignId('footer_layout_id')->constrained()->cascadeOnDelete();
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('custom_classes')->nullable();
            $table->string('visibility')->default('all'); // all, desktop, mobile
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('footer_components');
    }
};
