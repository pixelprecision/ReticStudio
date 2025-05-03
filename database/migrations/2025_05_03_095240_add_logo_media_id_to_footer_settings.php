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
        Schema::table('footer_settings', function (Blueprint $table) {
            $table->unsignedBigInteger('logo_media_id')->nullable()->after('logo');
            
            // Add foreign key constraint if appropriate
            // $table->foreign('logo_media_id')->references('id')->on('media')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('footer_settings', function (Blueprint $table) {
            // Drop foreign key if it was added
            // $table->dropForeign(['logo_media_id']);
            
            $table->dropColumn('logo_media_id');
        });
    }
};
