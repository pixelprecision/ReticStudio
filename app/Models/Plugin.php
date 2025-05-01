<?php
	// app/Models/Plugin.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	
	class Plugin extends Model
	{
		use HasFactory;
		
		protected $fillable = [
			'name',
			'slug',
			'description',
			'version',
			'config',
			'is_active',
			'is_system',
			'activated_by',
			'activated_at',
		];
		
		protected $casts = [
			'config' => 'array',
			'is_active' => 'boolean',
			'is_system' => 'boolean',
			'activated_at' => 'datetime',
		];
		
		public function activator()
		{
			return $this->belongsTo(User::class, 'activated_by');
		}
	}
