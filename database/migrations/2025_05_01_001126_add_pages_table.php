<?php
	
	// database/migrations/2023_05_01_000001_create_pages_table.php
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration
	{
		public function up()
		{
			Schema::create('pages', function (Blueprint $table) {
				$table->id();
				$table->string('title');
				$table->string('slug')->unique();
				$table->text('description')->nullable();
				$table->longText('content')->nullable(); // JSON data structure for page builder
				$table->text('meta_title')->nullable();
				$table->text('meta_description')->nullable();
				$table->text('meta_keywords')->nullable();
				$table->boolean('is_published')->default(false);
				$table->timestamp('published_at')->nullable();
				$table->unsignedBigInteger('created_by')->nullable();
				$table->unsignedBigInteger('updated_by')->nullable();
				$table->timestamps();
				$table->softDeletes();
				
				$table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
				$table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
			});
		}
		
		public function down()
		{
			Schema::dropIfExists('pages');
		}
	};
