<?php
	// app/Models/Theme.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	
	class Theme extends Model
	{
		use HasFactory;
		
		protected $fillable = [
			'name',
			'slug',
			'description',
			'styles',
			'is_active',
			'is_system',
			'created_by',
			'updated_by',
		];
		
		protected $casts = [
			'styles' => 'array',
			'is_active' => 'boolean',
			'is_system' => 'boolean',
		];
		
		public function creator()
		{
			return $this->belongsTo(User::class, 'created_by');
		}
		
		public function editor()
		{
			return $this->belongsTo(User::class, 'updated_by');
		}
	}
