<?php
	// database/seeders/MenuSeeder.php
	
	namespace Database\Seeders;
	
	use App\Models\Menu;
	use Illuminate\Database\Seeder;
	
	class MenuSeeder extends Seeder
	{
		/**
		 * Run the database seeds.
		 */
		public function run(): void
		{
			// Create default main menu
			Menu::create([
				'name' => 'Main Menu',
				'slug' => 'main-menu',
				'description' => 'The main navigation menu.',
				'items' => [
					[
						'id' => 'home',
						'label' => 'Home',
						'url' => '/',
						'target' => '_self',
						'items' => [],
					],
					[
						'id' => 'about',
						'label' => 'About',
						'url' => '/about',
						'target' => '_self',
						'items' => [],
					],
					[
						'id' => 'services',
						'label' => 'Services',
						'url' => '/services',
						'target' => '_self',
						'items' => [
							[
								'id' => 'service-1',
								'label' => 'Service 1',
								'url' => '/services/service-1',
								'target' => '_self',
								'items' => [],
							],
							[
								'id' => 'service-2',
								'label' => 'Service 2',
								'url' => '/services/service-2',
								'target' => '_self',
								'items' => [],
							],
							[
								'id' => 'service-3',
								'label' => 'Service 3',
								'url' => '/services/service-3',
								'target' => '_self',
								'items' => [],
							],
						],
					],
					[
						'id' => 'contact',
						'label' => 'Contact',
						'url' => '/contact',
						'target' => '_self',
						'items' => [],
					],
				],
				'is_active' => true,
			]);
			
			// Create default footer menu
			Menu::create([
				'name' => 'Footer Menu',
				'slug' => 'footer-menu',
				'description' => 'The footer navigation menu.',
				'items' => [
					[
						'id' => 'about',
						'label' => 'About Us',
						'url' => '/about',
						'target' => '_self',
						'items' => [],
					],
					[
						'id' => 'privacy',
						'label' => 'Privacy Policy',
						'url' => '/privacy-policy',
						'target' => '_self',
						'items' => [],
					],
					[
						'id' => 'terms',
						'label' => 'Terms of Service',
						'url' => '/terms-of-service',
						'target' => '_self',
						'items' => [],
					],
					[
						'id' => 'contact',
						'label' => 'Contact Us',
						'url' => '/contact',
						'target' => '_self',
						'items' => [],
					],
				],
				'is_active' => true,
			]);
		}
	}
