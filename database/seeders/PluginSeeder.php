<?php
	// database/seeders/PluginSeeder.php
	
	namespace Database\Seeders;
	
	use App\Models\Plugin;
	use Illuminate\Database\Seeder;
	
	class PluginSeeder extends Seeder
	{
		/**
		 * Run the database seeds.
		 */
		public function run(): void
		{
			// Create default plugins
			$plugins = [
				[
					'name' => 'SEO Manager',
					'slug' => 'seo-manager',
					'description' => 'Advanced SEO management for your website.',
					'version' => '1.0.0',
					'config' => [
						'enable_sitemap' => true,
						'sitemap_frequency' => 'weekly',
						'enable_meta_tags' => true,
						'enable_social_meta' => true,
						'enable_schema_markup' => true,
					],
					'is_active' => true,
					'is_system' => true,
					'activated_by' => 1, // Admin user
					'activated_at' => now(),
				],
				[
					'name' => 'Analytics',
					'slug' => 'analytics',
					'description' => 'Analytics integration for tracking website visitors.',
					'version' => '1.0.0',
					'config' => [
						'tracking_code' => '',
						'enable_demographics' => true,
						'enable_ecommerce' => false,
						'anonymize_ip' => true,
					],
					'is_active' => false,
					'is_system' => false,
				],
				[
					'name' => 'Social Media Integration',
					'slug' => 'social-media',
					'description' => 'Integrate social media sharing and feeds into your website.',
					'version' => '1.0.0',
					'config' => [
						'enable_sharing' => true,
						'facebook_app_id' => '',
						'twitter_handle' => '',
						'enable_comments' => false,
					],
					'is_active' => false,
					'is_system' => false,
				],
				[
					'name' => 'Backup Manager',
					'slug' => 'backup-manager',
					'description' => 'Automated backups for your website and database.',
					'version' => '1.0.0',
					'config' => [
						'backup_frequency' => 'daily',
						'backup_retention' => 7,
						'backup_destination' => 'local',
						'enable_notifications' => true,
					],
					'is_active' => true,
					'is_system' => true,
					'activated_by' => 1, // Admin user
					'activated_at' => now(),
				],
			];
			
			foreach ($plugins as $plugin) {
				Plugin::create($plugin);
			}
		}
	}
