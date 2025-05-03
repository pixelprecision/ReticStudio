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
        Schema::create('footer_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->nullable();
            $table->string('copyright_text')->nullable();
            $table->string('footer_style')->default('standard'); // standard, centered, columns
            $table->boolean('show_footer')->default(true);
            $table->boolean('show_footer_bar')->default(true);
            $table->string('footer_bar_message')->nullable();
            $table->string('footer_bar_badge_color')->nullable();
            $table->string('footer_background_color')->nullable();
            $table->string('footer_text_color')->nullable();
            $table->boolean('show_social_icons')->default(true);
            $table->json('social_links')->nullable();
            $table->string('logo')->nullable();
            $table->text('custom_css')->nullable();
            $table->string('custom_footer_classes')->nullable();
            $table->string('custom_footer_bar_classes')->nullable();
            $table->string('custom_logo_classes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('footer_settings');
    }
};
