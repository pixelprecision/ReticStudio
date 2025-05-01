<?php
	namespace Database\Seeders;
	
	use App\Models\User;
	use Illuminate\Database\Seeder;
	use Illuminate\Support\Facades\Hash;
	
	class UserSeeder extends Seeder
	{
		/**
		 * Run the database seeds.
		 */
		public function run(): void
		{
			// Create admin user
			$admin = User::create([
				'name' => 'Admin',
				'email' => 'admin@example.com',
				'password' => Hash::make('password'),
				'email_verified_at' => now(),
				'is_active' => true,
			]);
			
			$admin->assignRole('admin');
			
			// Create editor user
			$editor = User::create([
				'name' => 'Editor',
				'email' => 'editor@example.com',
				'password' => Hash::make('password'),
				'email_verified_at' => now(),
				'is_active' => true,
			]);
			
			$editor->assignRole('editor');
			
			// Create author user
			$author = User::create([
				'name' => 'Author',
				'email' => 'author@example.com',
				'password' => Hash::make('password'),
				'email_verified_at' => now(),
				'is_active' => true,
			]);
			
			$author->assignRole('author');
		}
	}
