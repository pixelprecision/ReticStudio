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
        Schema::create('header_components', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // logo, menu, search, auth, cart, custom
            $table->string('position')->default('header'); // topbar, header, subheader
            $table->json('settings')->nullable();
            $table->integer('order')->default(0);
            $table->foreignId('header_layout_id')->constrained('header_layouts')->onDelete('cascade');
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
        Schema::dropIfExists('header_components');
    }
};
