<?php
	
	// database/migrations/2023_05_01_000007_create_settings_table.php
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration
	{
		public function up()
		{
			Schema::create('settings', function (Blueprint $table) {
				$table->id();
				$table->string('group');
				$table->string('key')->unique();
				$table->longText('value')->nullable();
				$table->string('type')->default('string');
				$table->boolean('is_system')->default(false);
				$table->unsignedBigInteger('updated_by')->nullable();
				$table->timestamps();
				
				$table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
			});
		}
		
		public function down()
		{
			Schema::dropIfExists('settings');
		}
	};
