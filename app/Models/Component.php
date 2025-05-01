<?php
	// app/Models/Component.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	
	class Component extends Model
	{
		use HasFactory;
		
		protected $fillable = [
			'name',
			'slug',
			'description',
			'category',
			'icon',
			'schema',
			'template',
			'is_system',
			'is_active',
			'created_by',
			'updated_by',
		];
		
		protected $casts = [
			'schema' => 'array',
			'is_system' => 'boolean',
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
	}
