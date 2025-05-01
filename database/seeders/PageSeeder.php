<?php
	// database/seeders/PageSeeder.php
	
	namespace Database\Seeders;
	
	use App\Models\Page;
	use Illuminate\Database\Seeder;
	
	class PageSeeder extends Seeder
	{
		/**
		 * Run the database seeds.
		 */
		public function run(): void
		{
			// Create default home page
			$homePage = Page::create([
				'title' => 'Home',
				'slug' => 'home',
				'description' => 'Welcome to LaravelCMS Builder',
				'content' => [
					[
						'id' => 'heading-1',
						'type' => 'heading',
						'props' => [
							'level' => 'h1',
							'text' => 'Welcome to LaravelCMS Builder',
							'alignment' => 'center',
						],
					],
					[
						'id' => 'text-1',
						'type' => 'text',
						'props' => [
							'content' => '<p>LaravelCMS Builder is a comprehensive web application development platform that empowers users to create, customize, and deploy feature-rich websites with minimal technical knowledge.</p>',
						],
					],
					[
						'id' => 'button-1',
						'type' => 'button',
						'props' => [
							'text' => 'Learn More',
							'link' => '/about',
							'style' => 'primary',
							'size' => 'lg',
							'alignment' => 'center',
							'target' => '_self',
						],
					],
				],
				'meta_title' => 'Home | LaravelCMS Builder',
				'meta_description' => 'Welcome to LaravelCMS Builder - A powerful CMS built with Laravel',
				'meta_keywords' => 'laravel, cms, builder, home',
				'is_published' => true,
				'published_at' => now(),
				'created_by' => 1, // Admin user
				'updated_by' => 1, // Admin user
			]);
			
			// Create revision for home page
			$homePage->createRevision();
			
			// Create about page
			$aboutPage = Page::create([
				'title' => 'About',
				'slug' => 'about',
				'description' => 'About LaravelCMS Builder',
				'content' => [
					[
						'id' => 'heading-1',
						'type' => 'heading',
						'props' => [
							'level' => 'h1',
							'text' => 'About LaravelCMS Builder',
							'alignment' => 'left',
						],
					],
					[
						'id' => 'text-1',
						'type' => 'text',
						'props' => [
							'content' => '<p>LaravelCMS Builder is a comprehensive web application development platform that empowers users to create, customize, and deploy feature-rich websites with minimal technical knowledge. By combining the power of Laravel\'s robust backend with React\'s dynamic frontend capabilities, this solution offers an intuitive drag-and-drop interface for building responsive, database-driven web applications.</p><p>Our platform is designed to bridge the gap between code-heavy development and no-code solutions, offering the flexibility and power of custom development with the accessibility of visual builders.</p>',
						],
					],
				],
				'meta_title' => 'About | LaravelCMS Builder',
				'meta_description' => 'Learn about LaravelCMS Builder - A powerful CMS built with Laravel',
				'meta_keywords' => 'laravel, cms, builder, about',
				'is_published' => true,
				'published_at' => now(),
				'created_by' => 1, // Admin user
				'updated_by' => 1, // Admin user
			]);
			
			// Create revision for about page
			$aboutPage->createRevision();
			
			// Create contact page
			$contactPage = Page::create([
				'title' => 'Contact',
				'slug' => 'contact',
				'description' => 'Contact LaravelCMS Builder',
				'content' => [
					[
						'id' => 'heading-1',
						'type' => 'heading',
						'props' => [
							'level' => 'h1',
							'text' => 'Contact Us',
							'alignment' => 'left',
						],
					],
					[
						'id' => 'text-1',
						'type' => 'text',
						'props' => [
							'content' => '<p>We\'d love to hear from you! Please use the form below to get in touch with us.</p>',
						],
					],
					[
						'id' => 'form-1',
						'type' => 'form',
						'props' => [
							'form_id' => '1', // This will be linked to the Contact form created in FormSeeder
							'title' => 'Contact Form',
							'description' => 'Fill out the form below and we\'ll get back to you as soon as possible.',
							'submit_button_text' => 'Send Message',
						],
					],
				],
				'meta_title' => 'Contact | LaravelCMS Builder',
				'meta_description' => 'Contact the LaravelCMS Builder team',
				'meta_keywords' => 'laravel, cms, builder, contact',
				'is_published' => true,
				'published_at' => now(),
				'created_by' => 1, // Admin user
				'updated_by' => 1, // Admin user
			]);
			
			// Create revision for contact page
			$contactPage->createRevision();
		}
	}
