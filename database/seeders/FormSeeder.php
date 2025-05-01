<?php
	// database/seeders/FormSeeder.php
	
	namespace Database\Seeders;
	
	use App\Models\Form;
	use Illuminate\Database\Seeder;
	
	class FormSeeder extends Seeder
	{
		/**
		 * Run the database seeds.
		 */
		public function run(): void
		{
			// Create default contact form
			Form::create([
				'name' => 'Contact Form',
				'slug' => 'contact-form',
				'description' => 'Default contact form for the website.',
				'schema' => [
					[
						'name' => 'name',
						'type' => 'text',
						'label' => 'Your Name',
						'placeholder' => 'Enter your full name',
						'required' => true,
						'order' => 1,
					],
					[
						'name' => 'email',
						'type' => 'email',
						'label' => 'Email Address',
						'placeholder' => 'Enter your email address',
						'required' => true,
						'order' => 2,
					],
					[
						'name' => 'subject',
						'type' => 'text',
						'label' => 'Subject',
						'placeholder' => 'Enter message subject',
						'required' => true,
						'order' => 3,
					],
					[
						'name' => 'message',
						'type' => 'textarea',
						'label' => 'Message',
						'placeholder' => 'Enter your message',
						'required' => true,
						'rows' => 5,
						'order' => 4,
					],
				],
				'validation_rules' => [
					'name' => 'required|string|max:255',
					'email' => 'required|email|max:255',
					'subject' => 'required|string|max:255',
					'message' => 'required|string',
				],
				'store_submissions' => true,
				'send_notifications' => true,
				'notification_emails' => 'admin@example.com',
				'notification_template' => "New Contact Form Submission\n\nName: {{ name }}\nEmail: {{ email }}\nSubject: {{ subject }}\n\nMessage:\n{{ message }}",
				'enable_captcha' => true,
				'is_active' => true,
				'created_by' => 1, // Admin user
				'updated_by' => 1, // Admin user
			]);
			
			// Create newsletter subscription form
			Form::create([
				'name' => 'Newsletter Subscription',
				'slug' => 'newsletter-subscription',
				'description' => 'Form for users to subscribe to the newsletter.',
				'schema' => [
					[
						'name' => 'email',
						'type' => 'email',
						'label' => 'Email Address',
						'placeholder' => 'Enter your email address',
						'required' => true,
						'order' => 1,
					],
					[
						'name' => 'name',
						'type' => 'text',
						'label' => 'Your Name',
						'placeholder' => 'Enter your full name',
						'required' => false,
						'order' => 2,
					],
					[
						'name' => 'consent',
						'type' => 'checkbox',
						'label' => 'I agree to receive emails from LaravelCMS Builder.',
						'required' => true,
						'order' => 3,
					],
				],
				'validation_rules' => [
					'email' => 'required|email|max:255',
					'name' => 'nullable|string|max:255',
					'consent' => 'required|accepted',
				],
				'store_submissions' => true,
				'send_notifications' => false,
				'enable_captcha' => true,
				'is_active' => true,
				'created_by' => 1, // Admin user
				'updated_by' => 1, // Admin user
			]);
		}
	}
