<?php
	// app/Models/User.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Foundation\Auth\User as Authenticatable;
	use Illuminate\Notifications\Notifiable;
	use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
	use Spatie\Permission\Traits\HasRoles;
	use Spatie\MediaLibrary\HasMedia;
	use Spatie\MediaLibrary\InteractsWithMedia;
	
	class User extends Authenticatable implements HasMedia, JWTSubject
	{
		use HasFactory, Notifiable, HasRoles, InteractsWithMedia;
		
		protected $fillable = [
			'name',
			'email',
			'password',
			'is_active',
			'last_login_at',
		];
		
		protected $hidden = [
			'password',
			'remember_token',
		];
		
		protected $casts = [
			'email_verified_at' => 'datetime',
			'last_login_at' => 'datetime',
			'is_active' => 'boolean',
		];
		
		public function createdPages()
		{
			return $this->hasMany(Page::class, 'created_by');
		}
		
		public function updatedPages()
		{
			return $this->hasMany(Page::class, 'updated_by');
		}
		
		public function createdComponents()
		{
			return $this->hasMany(Component::class, 'created_by');
		}
		
		public function updatedComponents()
		{
			return $this->hasMany(Component::class, 'updated_by');
		}
		
		public function createdForms()
		{
			return $this->hasMany(Form::class, 'created_by');
		}
		
		public function updatedForms()
		{
			return $this->hasMany(Form::class, 'updated_by');
		}
		
		public function createdThemes()
		{
			return $this->hasMany(Theme::class, 'created_by');
		}
		
		public function updatedThemes()
		{
			return $this->hasMany(Theme::class, 'updated_by');
		}
		
		public function updatedSettings()
		{
			return $this->hasMany(Setting::class, 'updated_by');
		}
		
		public function registerMediaCollections(): void
		{
			$this->addMediaCollection('avatar')
			     ->singleFile()
			     ->useDisk('public');
		}
		
		/**
		 * Get the identifier that will be stored in the subject claim of the JWT.
		 *
		 * @return mixed
		 */
		public function getJWTIdentifier()
		{
			return $this->getKey();
		}
		
		/**
		 * Return a key value array, containing any custom claims to be added to the JWT.
		 *
		 * @return array
		 */
		public function getJWTCustomClaims()
		{
			return [];
		}
	}
