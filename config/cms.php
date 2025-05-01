<?php
	// config/cms.php
	
	return [
		/*
		|--------------------------------------------------------------------------
		| CMS Name
		|--------------------------------------------------------------------------
		|
		| This value is the name of your CMS. This value is used when the
		| framework needs to display the name of the CMS in notifications or
		| in various other places in the application.
		|
		*/
		'name' => env('CMS_NAME', 'LaravelCMS Builder'),
		
		/*
		|--------------------------------------------------------------------------
		| CMS Version
		|--------------------------------------------------------------------------
		|
		| This value is the version of your CMS.
		|
		*/
		'version' => '1.0.0',
		
		/*
		|--------------------------------------------------------------------------
		| CMS URL
		|--------------------------------------------------------------------------
		|
		| This URL is used by the CMS to properly generate URLs to your admin panel.
		| You should set this to the root of your application so that it is used when
		| URL generation or domain specific middleware needs this value.
		|
		*/
		'url' => env('CMS_URL', 'http://localhost'),
		
		/*
		|--------------------------------------------------------------------------
		| CMS Admin Path
		|--------------------------------------------------------------------------
		|
		| This is the URI path where the CMS admin panel will be accessible from.
		| You are free to change this path to anything you like.
		|
		*/
		'admin_path' => env('CMS_ADMIN_PATH', 'admin'),
		
		/*
		|--------------------------------------------------------------------------
		| CMS API Path
		|--------------------------------------------------------------------------
		|
		| This is the URI path where the CMS API will be accessible from.
		| You are free to change this path to anything you like.
		|
		*/
		'api_path' => env('CMS_API_PATH', 'api'),
		
		/*
		|--------------------------------------------------------------------------
		| CMS Media
		|--------------------------------------------------------------------------
		|
		| These options configure the media management in the CMS.
		|
		*/
		'media' => [
			// Maximum upload size in MB
			'max_upload_size' => env('CMS_MEDIA_MAX_UPLOAD_SIZE', 10),
			
			// Allowed file types (MIME types)
			'allowed_types' => [
				'image/jpeg',
				'image/png',
				'image/gif',
				'image/svg+xml',
				'application/pdf',
				'application/zip',
				'application/msword',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'application/vnd.ms-excel',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'text/plain',
				'text/csv',
			],
			
			// Image thumbnails configuration
			'thumbnails' => [
				'sizes' => [
					'small' => [
						'width' => 150,
						'height' => 150,
					],
					'medium' => [
						'width' => 300,
						'height' => 300,
					],
					'large' => [
						'width' => 600,
						'height' => 600,
					],
				],
			],
		],
		
		/*
		|--------------------------------------------------------------------------
		| CMS Pages
		|--------------------------------------------------------------------------
		|
		| These options configure the pages in the CMS.
		|
		*/
		'pages' => [
			// Number of revisions to keep per page
			'max_revisions' => env('CMS_PAGES_MAX_REVISIONS', 10),
			
			// Default page status (draft or published)
			'default_status' => env('CMS_PAGES_DEFAULT_STATUS', 'draft'),
		],
		
		/*
		|--------------------------------------------------------------------------
		| CMS Forms
		|--------------------------------------------------------------------------
		|
		| These options configure the forms in the CMS.
		|
		*/
		'forms' => [
			// Enable CAPTCHA for form submissions
			'enable_captcha' => env('CMS_FORMS_ENABLE_CAPTCHA', true),
			
			// CAPTCHA type (recaptcha, honeypot)
			'captcha_type' => env('CMS_FORMS_CAPTCHA_TYPE', 'recaptcha'),
			
			// reCAPTCHA site key
			'recaptcha_site_key' => env('RECAPTCHA_SITE_KEY'),
			
			// reCAPTCHA secret key
			'recaptcha_secret_key' => env('RECAPTCHA_SECRET_KEY'),
			
			// Default email for form notifications
			'default_notification_email' => env('CMS_FORMS_DEFAULT_NOTIFICATION_EMAIL'),
		],
		
		/*
		|--------------------------------------------------------------------------
		| CMS Auth
		|--------------------------------------------------------------------------
		|
		| These options configure the authentication in the CMS.
		|
		*/
		'auth' => [
			// Token lifetime in minutes
			'token_lifetime' => env('CMS_AUTH_TOKEN_LIFETIME', 60),
			
			// Enable registration
			'enable_registration' => env('CMS_AUTH_ENABLE_REGISTRATION', false),
			
			// Default role for new users
			'default_role' => env('CMS_AUTH_DEFAULT_ROLE', 'user'),
			
			// Enable email verification
			'enable_email_verification' => env('CMS_AUTH_ENABLE_EMAIL_VERIFICATION', true),
		],
		
		/*
		|--------------------------------------------------------------------------
		| CMS SEO
		|--------------------------------------------------------------------------
		|
		| These options configure the SEO features in the CMS.
		|
		*/
		'seo' => [
			// Default meta title template
			'meta_title_template' => env('CMS_SEO_META_TITLE_TEMPLATE', '{title} | {site_name}'),
			
			// Default meta description
			'meta_description' => env('CMS_SEO_META_DESCRIPTION', 'LaravelCMS Builder - A powerful CMS built with Laravel'),
			
			// Default meta keywords
			'meta_keywords' => env('CMS_SEO_META_KEYWORDS', 'laravel, cms, builder'),
			
			// Generate sitemap automatically
			'auto_sitemap' => env('CMS_SEO_AUTO_SITEMAP', true),
		],
		
		/*
		|--------------------------------------------------------------------------
		| CMS Plugins
		|--------------------------------------------------------------------------
		|
		| These options configure the plugins in the CMS.
		|
		*/
		'plugins' => [
			// Enable plugins
			'enable_plugins' => env('CMS_PLUGINS_ENABLE', true),
			
			// Plugins directory
			'directory' => env('CMS_PLUGINS_DIRECTORY', 'plugins'),
			
			// Auto-activation of newly installed plugins
			'auto_activate' => env('CMS_PLUGINS_AUTO_ACTIVATE', false),
		],
		
		/*
		|--------------------------------------------------------------------------
		| CMS Cache
		|--------------------------------------------------------------------------
		|
		| These options configure the caching in the CMS.
		|
		*/
		'cache' => [
			// Enable caching
			'enable' => env('CMS_CACHE_ENABLE', true),
			
			// Cache lifetime in minutes
			'lifetime' => env('CMS_CACHE_LIFETIME', 60),
		],
	];
