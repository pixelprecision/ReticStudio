<?php
	// app/Models/FormSubmission.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	
	class FormSubmission extends Model
	{
		use HasFactory;
		
		protected $fillable = [
			'form_id',
			'data',
			'ip_address',
			'user_agent',
			'is_spam',
		];
		
		protected $casts = [
			'data' => 'array',
			'is_spam' => 'boolean',
		];
		
		public function form()
		{
			return $this->belongsTo(Form::class);
		}
	}
