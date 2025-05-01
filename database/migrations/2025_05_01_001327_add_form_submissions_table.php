<?php
	
	// database/migrations/2023_05_01_000005_create_form_submissions_table.php
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration
	{
		public function up()
		{
			Schema::create('form_submissions', function (Blueprint $table) {
				$table->id();
				$table->unsignedBigInteger('form_id');
				$table->longText('data'); // JSON submission data
				$table->string('ip_address')->nullable();
				$table->string('user_agent')->nullable();
				$table->boolean('is_spam')->default(false);
				$table->timestamps();
				
				$table->foreign('form_id')->references('id')->on('forms')->onDelete('cascade');
			});
		}
		
		public function down()
		{
			Schema::dropIfExists('form_submissions');
		}
	};
