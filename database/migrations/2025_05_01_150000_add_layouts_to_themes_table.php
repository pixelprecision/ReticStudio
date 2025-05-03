<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migration to add layouts field to themes table.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('themes', function (Blueprint $table) {
            // Add layouts field to support different React layout components
            $table->json('layouts')->nullable()->after('styles');
            
            // Add default_layout field to specify which layout to use by default
            $table->string('default_layout')->nullable()->after('layouts');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('themes', function (Blueprint $table) {
            $table->dropColumn('layouts');
            $table->dropColumn('default_layout');
        });
    }
};