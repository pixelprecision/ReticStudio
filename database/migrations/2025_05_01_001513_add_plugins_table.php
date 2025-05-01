<?php
	
	// database/migrations/2023_05_01_000010_create_plugins_table.php
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration
	{
		public function up()
		{
			Schema::create('plugins', function (Blueprint $table) {
				$table->id();
				$table->string('name');
				$table->string('slug')->unique();
				$table->text('description')->nullable();
				$table->string('version');
				$table->longText('config')->nullable(); // JSON configuration
				$table->boolean('is_active')->default(false);
				$table->boolean('is_system')->default(false);
				$table->unsignedBigInteger('activated_by')->nullable();
				$table->timestamp('activated_at')->nullable();
				$table->timestamps();
				
				$table->foreign('activated_by')->references('id')->on('users')->onDelete('set null');
			});
		}
		
		public function down()
		{
			Schema::dropIfExists('plugins');
		}
	};
