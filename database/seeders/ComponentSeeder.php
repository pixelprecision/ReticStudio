<?php
	// database/seeders/ComponentSeeder.php
	
	namespace Database\Seeders;
	
	use App\Models\Component;
	use Illuminate\Database\Seeder;
	
	class ComponentSeeder extends Seeder
	{
		/**
		 * Run the database seeds.
		 */
		public function run(): void
		{
			// Create default components for the page builder
			$components = [
				[
					'name' => 'Heading',
					'slug' => 'heading',
					'description' => 'Heading component with customizable level and text.',
					'category' => 'text',
					'icon' => 'heading',
					'is_system' => true,
					'is_active' => true,
					'schema' => [
						'properties' => [
							'level' => [
								'type' => 'select',
								'label' => 'Heading Level',
								'options' => [
									['value' => 'h1', 'label' => 'H1'],
									['value' => 'h2', 'label' => 'H2'],
									['value' => 'h3', 'label' => 'H3'],
									['value' => 'h4', 'label' => 'H4'],
									['value' => 'h5', 'label' => 'H5'],
									['value' => 'h6', 'label' => 'H6'],
								],
								'default' => 'h2',
							],
							'text' => [
								'type' => 'text',
								'label' => 'Text',
								'placeholder' => 'Enter heading text',
								'default' => 'Heading',
							],
							'alignment' => [
								'type' => 'select',
								'label' => 'Alignment',
								'options' => [
									['value' => 'left', 'label' => 'Left'],
									['value' => 'center', 'label' => 'Center'],
									['value' => 'right', 'label' => 'Right'],
								],
								'default' => 'left',
							],
						],
					],
					'template' => "
                    <div className=\"heading-component\">
                        {React.createElement(props.level, {
                            style: { textAlign: props.alignment },
                        }, props.text)}
                    </div>
                ",
				],
				[
					'name' => 'Text',
					'slug' => 'text',
					'description' => 'Simple text component with rich text editor.',
					'category' => 'text',
					'icon' => 'text',
					'is_system' => true,
					'is_active' => true,
					'schema' => [
						'properties' => [
							'content' => [
								'type' => 'rich-text',
								'label' => 'Content',
								'default' => '<p>Enter your text here</p>',
							],
						],
					],
					'template' => "
                    <div className=\"text-component\" dangerouslySetInnerHTML={{ __html: props.content }} />
                ",
				],
				[
					'name' => 'Image',
					'slug' => 'image',
					'description' => 'Image component with alt text and caption.',
					'category' => 'media',
					'icon' => 'image',
					'is_system' => true,
					'is_active' => true,
					'schema' => [
						'properties' => [
							'src' => [
								'type' => 'media',
								'label' => 'Image',
								'accept' => 'image/*',
								'default' => '',
							],
							'alt' => [
								'type' => 'text',
								'label' => 'Alt Text',
								'placeholder' => 'Enter alt text for image',
								'default' => '',
							],
							'caption' => [
								'type' => 'text',
								'label' => 'Caption',
								'placeholder' => 'Enter image caption',
								'default' => '',
							],
							'alignment' => [
								'type' => 'select',
								'label' => 'Alignment',
								'options' => [
									['value' => 'left', 'label' => 'Left'],
									['value' => 'center', 'label' => 'Center'],
									['value' => 'right', 'label' => 'Right'],
								],
								'default' => 'center',
							],
						],
					],
					'template' => "
                    <div className=\"image-component\" style={{ textAlign: props.alignment }}>
                        <img src={props.src} alt={props.alt} style={{ maxWidth: '100%' }} />
                        {props.caption && <div className=\"caption\">{props.caption}</div>}
                    </div>
                ",
				],
				[
					'name' => 'Button',
					'slug' => 'button',
					'description' => 'Button component with customizable text, link, and style.',
					'category' => 'interactive',
					'icon' => 'button',
					'is_system' => true,
					'is_active' => true,
					'schema' => [
						'properties' => [
							'text' => [
								'type' => 'text',
								'label' => 'Button Text',
								'placeholder' => 'Enter button text',
								'default' => 'Click Me',
							],
							'link' => [
								'type' => 'text',
								'label' => 'Button Link',
								'placeholder' => 'Enter button link URL',
								'default' => '#',
							],
							'style' => [
								'type' => 'select',
								'label' => 'Button Style',
								'options' => [
									['value' => 'primary', 'label' => 'Primary'],
									['value' => 'secondary', 'label' => 'Secondary'],
									['value' => 'success', 'label' => 'Success'],
									['value' => 'danger', 'label' => 'Danger'],
									['value' => 'warning', 'label' => 'Warning'],
									['value' => 'info', 'label' => 'Info'],
									['value' => 'light', 'label' => 'Light'],
									['value' => 'dark', 'label' => 'Dark'],
									['value' => 'link', 'label' => 'Link'],
								],
								'default' => 'primary',
							],
							'size' => [
								'type' => 'select',
								'label' => 'Button Size',
								'options' => [
									['value' => 'sm', 'label' => 'Small'],
									['value' => 'md', 'label' => 'Medium'],
									['value' => 'lg', 'label' => 'Large'],
								],
								'default' => 'md',
							],
							'alignment' => [
								'type' => 'select',
								'label' => 'Alignment',
								'options' => [
									['value' => 'left', 'label' => 'Left'],
									['value' => 'center', 'label' => 'Center'],
									['value' => 'right', 'label' => 'Right'],
								],
								'default' => 'left',
							],
							'target' => [
								'type' => 'select',
								'label' => 'Open Link In',
								'options' => [
									['value' => '_self', 'label' => 'Same Window'],
									['value' => '_blank', 'label' => 'New Window'],
								],
								'default' => '_self',
							],
						],
					],
					'template' => "
                    <div className=\"button-component\" style={{ textAlign: props.alignment }}>
                        <a
                            href={props.link}
                            target={props.target}
                            className={`btn btn-\${props.style} btn-\${props.size}`}
                        >
                            {props.text}
                        </a>
                    </div>
                ",
				],
				[
					'name' => 'Form',
					'slug' => 'form',
					'description' => 'Form component to display and process forms.',
					'category' => 'interactive',
					'icon' => 'form',
					'is_system' => true,
					'is_active' => true,
					'schema' => [
						'properties' => [
							'form_id' => [
								'type' => 'form-select',
								'label' => 'Select Form',
								'default' => '',
							],
							'title' => [
								'type' => 'text',
								'label' => 'Form Title',
								'placeholder' => 'Enter form title',
								'default' => '',
							],
							'description' => [
								'type' => 'textarea',
								'label' => 'Form Description',
								'placeholder' => 'Enter form description',
								'default' => '',
							],
							'submit_button_text' => [
								'type' => 'text',
								'label' => 'Submit Button Text',
								'default' => 'Submit',
							],
						],
					],
					'template' => "
                    <div className=\"form-component\">
                        {props.title && <h3>{props.title}</h3>}
                        {props.description && <div className=\"form-description\">{props.description}</div>}
                        <div className=\"form-placeholder\" data-form-id={props.form_id}>
                            {/* Form will be rendered by the frontend application */}
                            [Form: {props.form_id}]
                        </div>
                    </div>
                ",
				],
			];
			
			foreach ($components as $component) {
				Component::create($component);
			}
		}
	}
