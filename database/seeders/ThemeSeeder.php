<?php
	// database/seeders/ThemeSeeder.php
	
	namespace Database\Seeders;
	
	use App\Models\Theme;
	use Illuminate\Database\Seeder;
	
	class ThemeSeeder extends Seeder
	{
		/**
		 * Run the database seeds.
		 */
		public function run(): void
		{
			// Create default theme
			Theme::create([
				'name' => 'Default Theme',
				'slug' => 'default-theme',
				'description' => 'The default theme for Retic Laravel Studio.',
				'styles' => [
					'colors' => [
						'primary' => '#3490dc',
						'secondary' => '#6c757d',
						'success' => '#38c172',
						'danger' => '#e3342f',
						'warning' => '#f6993f',
						'info' => '#6cb2eb',
						'light' => '#f8f9fa',
						'dark' => '#212529',
						'body' => '#ffffff',
						'text' => '#212529',
					],
					'fonts' => [
						'body' => '"Nunito", sans-serif',
						'heading' => '"Nunito", sans-serif',
					],
					'font_sizes' => [
						'base' => '16px',
						'h1' => '2.5rem',
						'h2' => '2rem',
						'h3' => '1.75rem',
						'h4' => '1.5rem',
						'h5' => '1.25rem',
						'h6' => '1rem',
						'small' => '0.875rem',
					],
					'spacing' => [
						'container_width' => '1140px',
						'grid_gutter' => '30px',
						'section_spacing' => '60px',
					],
					'borders' => [
						'radius' => '0.25rem',
						'width' => '1px',
					],
					'header' => [
						'background' => '#ffffff',
						'text_color' => '#212529',
						'height' => '80px',
					],
					'footer' => [
						'background' => '#f8f9fa',
						'text_color' => '#212529',
						'padding' => '40px 0',
					],
				],
				'is_active' => true,
				'is_system' => true,
			]);
		}
	}
