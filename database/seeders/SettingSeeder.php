<?php
	// database/seeders/SettingSeeder.php
	
	namespace Database\Seeders;
	
	use App\Models\Setting;
	use Illuminate\Database\Seeder;
	
	class SettingSeeder extends Seeder
	{
		/**
		 * Run the database seeds.
		 */
		public function run(): void
		{
			// General settings
			$generalSettings = [
				[
					'group' => 'general',
					'key' => 'site_name',
					'value' => 'LaravelCMS Builder',
					'type' => 'string',
					'is_system' => true,
				],
				[
					'group' => 'general',
					'key' => 'site_description',
					'value' => 'A powerful CMS built with Laravel',
					'type' => 'string',
					'is_system' => true,
				],
				[
					'group' => 'general',
					'key' => 'site_logo',
					'value' => '',
					'type' => 'string',
					'is_system' => false,
				],
				[
					'group' => 'general',
					'key' => 'site_favicon',
					'value' => '',
					'type' => 'string',
					'is_system' => false,
				],
				[
					'group' => 'general',
					'key' => 'contact_email',
					'value' => 'contact@example.com',
					'type' => 'email',
					'is_system' => false,
				],
			];
			
			// SEO settings
			$seoSettings = [
				[
					'group' => 'seo',
					'key' => 'meta_title_template',
					'value' => '{title} | {site_name}',
					'type' => 'string',
					'is_system' => true,
				],
				[
					'group' => 'seo',
					'key' => 'meta_description',
					'value' => 'LaravelCMS Builder - A powerful CMS built with Laravel',
					'type' => 'string',
					'is_system' => true,
				],
				[
					'group' => 'seo',
					'key' => 'meta_keywords',
					'value' => 'laravel, cms, builder',
					'type' => 'string',
					'is_system' => true,
				],
				[
					'group' => 'seo',
					'key' => 'google_analytics_id',
					'value' => '',
					'type' => 'string',
					'is_system' => false,
				],
			];
			
			// Social media settings
			$socialSettings = [
				[
					'group' => 'social',
					'key' => 'facebook_url',
					'value' => '',
					'type' => 'url',
					'is_system' => false,
				],
				[
					'group' => 'social',
					'key' => 'twitter_url',
					'value' => '',
					'type' => 'url',
					'is_system' => false,
				],
				[
					'group' => 'social',
					'key' => 'instagram_url',
					'value' => '',
					'type' => 'url',
					'is_system' => false,
				],
				[
					'group' => 'social',
					'key' => 'linkedin_url',
					'value' => '',
					'type' => 'url',
					'is_system' => false,
				],
			];
			
			// Email settings
			$emailSettings = [
				[
					'group' => 'email',
					'key' => 'from_name',
					'value' => 'LaravelCMS Builder',
					'type' => 'string',
					'is_system' => true,
				],
				[
					'group' => 'email',
					'key' => 'from_email',
					'value' => 'noreply@example.com',
					'type' => 'email',
					'is_system' => true,
				],
			];
			
			// Create all settings
			foreach (array_merge($generalSettings, $seoSettings, $socialSettings, $emailSettings) as $setting) {
				Setting::create($setting);
			}
		}
	}
