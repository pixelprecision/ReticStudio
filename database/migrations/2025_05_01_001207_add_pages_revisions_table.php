<?php
	
	// database/migrations/2023_05_01_000002_create_page_revisions_table.php
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration
	{
		public function up()
		{
			Schema::create('page_revisions', function (Blueprint $table) {
				$table->id();
				$table->unsignedBigInteger('page_id');
				$table->string('title');
				$table->text('description')->nullable();
				$table->longText('content')->nullable();
				$table->text('meta_title')->nullable();
				$table->text('meta_description')->nullable();
				$table->text('meta_keywords')->nullable();
				$table->unsignedBigInteger('created_by')->nullable();
				$table->timestamps();
				
				$table->foreign('page_id')->references('id')->on('pages')->onDelete('cascade');
				$table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
			});
		}
		
		public function down()
		{
			Schema::dropIfExists('page_revisions');
		}
	};
