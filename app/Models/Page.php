<?php
	// app/Models/Page.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	use Illuminate\Database\Eloquent\SoftDeletes;
	use Spatie\MediaLibrary\HasMedia;
	use Spatie\MediaLibrary\InteractsWithMedia;
	
	class Page extends Model implements HasMedia
	{
		use HasFactory, SoftDeletes, InteractsWithMedia;
		
		protected $fillable = [
			'title',
			'slug',
			'description',
			'content',
			'page_type',
			'meta_title',
			'meta_description',
			'meta_keywords',
			'layout',
			'is_published',
			'published_at',
			'created_by',
			'updated_by',
		];
		
		protected $casts = [
			'content' => 'array',
			'is_published' => 'boolean',
			'published_at' => 'datetime',
		];
		
		public function creator()
		{
			return $this->belongsTo(User::class, 'created_by');
		}
		
		public function editor()
		{
			return $this->belongsTo(User::class, 'updated_by');
		}
		
		public function revisions()
		{
			return $this->hasMany(PageRevision::class);
		}
		
		public function registerMediaCollections(): void
		{
			$this->addMediaCollection('featured_image')
			     ->singleFile()
			     ->useDisk('public');
			
			$this->addMediaCollection('gallery')
			     ->useDisk('public');
		}
		
		public function createRevision()
		{
			return $this->revisions()->create([
				'title' => $this->title,
				'description' => $this->description,
				'content' => $this->content,
				'meta_title' => $this->meta_title,
				'meta_description' => $this->meta_description,
				'meta_keywords' => $this->meta_keywords,
				'layout' => $this->layout,
				'created_by' => auth()->id(),
			]);
		}
	}