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
        Schema::table('header_settings', function (Blueprint $table) {
            $table->string('custom_header_classes')->nullable()->after('mobile_menu_type');
            $table->string('custom_topbar_classes')->nullable()->after('custom_header_classes');
            $table->string('custom_subheader_classes')->nullable()->after('custom_topbar_classes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('header_settings', function (Blueprint $table) {
            $table->dropColumn('custom_header_classes');
            $table->dropColumn('custom_topbar_classes');
            $table->dropColumn('custom_subheader_classes');
        });
    }
};