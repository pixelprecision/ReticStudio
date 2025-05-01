<?php
	// app/Models/PageRevision.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	
	class PageRevision extends Model
	{
		use HasFactory;
		
		protected $fillable = [
			'page_id',
			'title',
			'description',
			'content',
			'meta_title',
			'meta_description',
			'meta_keywords',
			'created_by',
		];
		
		protected $casts = [
			'content' => 'array',
		];
		
		public function page()
		{
			return $this->belongsTo(Page::class);
		}
		
		public function creator()
		{
			return $this->belongsTo(User::class, 'created_by');
		}
	}
