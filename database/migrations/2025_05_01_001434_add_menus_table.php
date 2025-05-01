<?php
	
	// database/migrations/2023_05_01_000008_create_menus_table.php
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration
	{
		public function up()
		{
			Schema::create('menus', function (Blueprint $table) {
				$table->id();
				$table->string('name');
				$table->string('slug')->unique();
				$table->text('description')->nullable();
				$table->longText('items'); // JSON menu structure
				$table->boolean('is_active')->default(true);
				$table->unsignedBigInteger('created_by')->nullable();
				$table->unsignedBigInteger('updated_by')->nullable();
				$table->timestamps();
				
				$table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
				$table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
			});
		}
		
		public function down()
		{
			Schema::dropIfExists('menus');
		}
	};
