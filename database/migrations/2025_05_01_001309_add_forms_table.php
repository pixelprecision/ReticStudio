<?php
	// database/migrations/2023_05_01_000004_create_forms_table.php
	use Illuminate\Database\Migrations\Migration;
	use Illuminate\Database\Schema\Blueprint;
	use Illuminate\Support\Facades\Schema;
	
	return new class extends Migration
	{
		public function up()
		{
			Schema::create('forms', function (Blueprint $table) {
				$table->id();
				$table->string('name');
				$table->string('slug')->unique();
				$table->text('description')->nullable();
				$table->longText('schema'); // JSON schema defining form fields
				$table->longText('validation_rules')->nullable(); // JSON validation rules
				$table->boolean('store_submissions')->default(true);
				$table->boolean('send_notifications')->default(false);
				$table->text('notification_emails')->nullable();
				$table->longText('notification_template')->nullable();
				$table->boolean('enable_captcha')->default(false);
				$table->boolean('is_active')->default(true);
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
			Schema::dropIfExists('forms');
		}
	};
