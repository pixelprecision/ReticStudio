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
        Schema::create('header_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('Site Name');
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->boolean('show_topbar')->default(false);
            $table->string('topbar_message')->nullable();
            $table->string('topbar_secondary_message')->nullable();
            $table->string('topbar_badge_color')->default('badge-info');
            $table->boolean('show_search')->default(true);
            $table->boolean('show_auth_buttons')->default(true);
            $table->boolean('show_cart')->default(true);
            $table->boolean('sticky_header')->default(true);
            $table->string('header_style')->default('standard'); // standard, centered, split
            $table->boolean('transparent_header')->default(false);
            $table->string('mobile_menu_type')->default('drawer'); // drawer, dropdown
            $table->json('custom_css')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('header_settings');
    }
};
