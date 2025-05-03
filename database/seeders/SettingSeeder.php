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
					'value' => 'Retic Laravel Studio',
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
					'value' => 'Retic Laravel Studio - A powerful CMS built with Laravel',
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
					'value' => 'Retic Laravel Studio',
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
			// Footer settings
			$footerSettings = [
				[
					'group' => 'footer',
					'key' => 'show_footer',
					'value' => true,
					'type' => 'boolean',
					'is_system' => false,
				],
				[
					'group' => 'footer',
					'key' => 'show_footer_bar',
					'value' => true,
					'type' => 'boolean',
					'is_system' => false,
				],
				[
					'group' => 'footer',
					'key' => 'footer_style',
					'value' => 'standard',
					'type' => 'string',
					'is_system' => false,
				],
				[
					'group' => 'footer',
					'key' => 'footer_background_color',
					'value' => '#1f2937',
					'type' => 'string',
					'is_system' => false,
				],
				[
					'group' => 'footer',
					'key' => 'footer_text_color',
					'value' => '#ffffff',
					'type' => 'string',
					'is_system' => false,
				],
				[
					'group' => 'footer',
					'key' => 'copyright_text',
					'value' => '© {year} Your Site. All rights reserved.',
					'type' => 'string',
					'is_system' => false,
				],
				[
					'group' => 'footer',
					'key' => 'footer_columns',
					'value' => 3,
					'type' => 'integer',
					'is_system' => false,
				],
				[
					'group' => 'footer',
					'key' => 'custom_footer_classes',
					'value' => '',
					'type' => 'string',
					'is_system' => false,
				],
				[
					'group' => 'footer',
					'key' => 'custom_footer_bar_classes',
					'value' => '',
					'type' => 'string',
					'is_system' => false,
				],
			];

			foreach (array_merge($generalSettings, $seoSettings, $socialSettings, $emailSettings, $footerSettings) as $setting) {
				Setting::create($setting);
			}
		}
	}
