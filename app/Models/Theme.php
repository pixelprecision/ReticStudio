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
			'layouts',
			'default_layout',
			'is_active',
			'is_system',
			'created_by',
			'updated_by',
		];
		
		protected $casts = [
			'styles' => 'array',
			'layouts' => 'array',
			'is_active' => 'boolean',
			'is_system' => 'boolean',
		];
		
		/**
		 * Get the active layout configuration
		 * 
		 * @return array|null
		 */
		public function getActiveLayout()
		{
			if (!$this->layouts || !$this->default_layout) {
				return null;
			}
			
			$layouts = $this->layouts;
			
			return $layouts[$this->default_layout] ?? null;
		}
		
		/**
		 * Get layout by page type
		 * 
		 * @param string $pageType
		 * @return array|null
		 */
		public function getLayoutForPageType($pageType)
		{
			if (!$this->layouts || !$pageType) {
				return $this->getActiveLayout();
			}
			
			$layouts = $this->layouts;
			
			// Use specific layout for page type if available, otherwise use default
			return $layouts[$pageType] ?? $layouts[$this->default_layout] ?? null;
		}
		
		public function creator()
		{
			return $this->belongsTo(User::class, 'created_by');
		}
		
		public function editor()
		{
			return $this->belongsTo(User::class, 'updated_by');
		}
	}
