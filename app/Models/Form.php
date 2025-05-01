<?php
	// app/Models/Form.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\SoftDeletes;
	
	class Form extends Model
	{
		use HasFactory, SoftDeletes;
		
		protected $fillable = [
			'name',
			'slug',
			'description',
			'schema',
			'validation_rules',
			'store_submissions',
			'send_notifications',
			'notification_emails',
			'notification_template',
			'enable_captcha',
			'is_active',
			'created_by',
			'updated_by',
		];
		
		protected $casts = [
			'schema' => 'array',
			'validation_rules' => 'array',
			'store_submissions' => 'boolean',
			'send_notifications' => 'boolean',
			'enable_captcha' => 'boolean',
			'is_active' => 'boolean',
		];
		
		public function creator()
		{
			return $this->belongsTo(User::class, 'created_by');
		}
		
		public function editor()
		{
			return $this->belongsTo(User::class, 'updated_by');
		}
		
		public function submissions()
		{
			return $this->hasMany(FormSubmission::class);
		}
	}
