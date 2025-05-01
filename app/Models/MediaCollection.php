<?php
	
	// app/Models/MediaCollection.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	
	class MediaCollection extends Model
	{
		use HasFactory;
		
		protected $fillable = [
			'name',
			'slug',
			'description',
			'created_by',
			'updated_by',
		];
		
		public function creator()
		{
			return $this->belongsTo(User::class, 'created_by');
		}
		
		public function editor()
		{
			return $this->belongsTo(User::class, 'updated_by');
		}
		
		public function media()
		{
			return $this->hasMany(Media::class, 'collection_name', 'slug');
		}
	}
