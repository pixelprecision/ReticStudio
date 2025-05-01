<?php
	// app/Models/Menu.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	
	class Menu extends Model
	{
		use HasFactory;
		
		protected $fillable = [
			'name',
			'slug',
			'description',
			'items',
			'is_active',
			'created_by',
			'updated_by',
		];
		
		protected $casts = [
			'items' => 'array',
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
