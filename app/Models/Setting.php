<?php
	// app/Models/Setting.php
	
	namespace App\Models;
	
	use Illuminate\Database\Eloquent\Factories\HasFactory;
	use Illuminate\Database\Eloquent\Model;
	
	class Setting extends Model
	{
		use HasFactory;
		
		protected $fillable = [
			'group',
			'key',
			'value',
			'type',
			'is_system',
			'updated_by',
		];
		
		protected $casts = [
			'is_system' => 'boolean',
		];
		
		public function editor()
		{
			return $this->belongsTo(User::class, 'updated_by');
		}
		
		public function getValueAttribute($value)
		{
			switch ($this->type) {
				case 'boolean':
					return (bool) $value;
				case 'integer':
					return (int) $value;
				case 'float':
					return (float) $value;
				case 'array':
				case 'json':
					return json_decode($value, true);
				default:
					return $value;
			}
		}
		
		public function setValueAttribute($value)
		{
			if (in_array($this->type, ['array', 'json']) && is_array($value)) {
				$this->attributes['value'] = json_encode($value);
			} else {
				$this->attributes['value'] = $value;
			}
		}
	}
