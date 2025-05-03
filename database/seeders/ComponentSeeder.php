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
					'schema' => json_encode([
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
					]),
					'template' => <<<'EOT'
                <div className="heading-component">
                    {React.createElement(props.level, {
                        style: { textAlign: props.alignment },
                    }, props.text)}
                </div>
EOT,
				],
				[
					'name' => 'Text',
					'slug' => 'text',
					'description' => 'Simple text component with rich text editor.',
					'category' => 'text',
					'icon' => 'text',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'content' => [
								'type' => 'rich-text',
								'label' => 'Content',
								'default' => '<p>Enter your text here</p>',
							],
						],
					]),
					'template' => <<<'EOT'
                <div className="text-component" dangerouslySetInnerHTML={{ __html: props.content }} />
EOT,
				],
				[
					'name' => 'Image',
					'slug' => 'image',
					'description' => 'Image component with alt text and caption.',
					'category' => 'media',
					'icon' => 'image',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
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
							'width' => [
								'type' => 'text',
								'label' => 'Width',
								'placeholder' => 'auto, 100%, or specific value (e.g., 500px)',
								'default' => 'auto',
							],
							'height' => [
								'type' => 'text',
								'label' => 'Height',
								'placeholder' => 'auto or specific value (e.g., 300px)',
								'default' => 'auto',
							],
						],
					]),
					'template' => <<<'EOT'
                <div className="image-component" style={{ textAlign: props.alignment }}>
                    <img src={props.src} alt={props.alt} style={{ maxWidth: '100%', width: props.width, height: props.height }} />
                    {props.caption && <div className="caption">{props.caption}</div>}
                </div>
EOT,
				],
				[
					'name' => 'Button',
					'slug' => 'button',
					'description' => 'Button component with customizable text, link, and style.',
					'category' => 'interactive',
					'icon' => 'button',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
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
									['value' => 'xl', 'label' => 'Extra Large'],
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
					]),
					'template' => <<<'EOT'
                <div className="button-component" style={{ textAlign: props.alignment }}>
                    <a
                        href={props.link}
                        target={props.target}
                        className={`btn btn-${props.style} btn-${props.size}`}
                    >
                        {props.text}
                    </a>
                </div>
EOT,
				],
				[
					'name' => 'Divider',
					'slug' => 'divider',
					'description' => 'Horizontal divider with customizable style.',
					'category' => 'layout',
					'icon' => 'divider',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'style' => [
								'type' => 'select',
								'label' => 'Style',
								'options' => [
									['value' => 'solid', 'label' => 'Solid'],
									['value' => 'dashed', 'label' => 'Dashed'],
									['value' => 'dotted', 'label' => 'Dotted'],
									['value' => 'double', 'label' => 'Double'],
								],
								'default' => 'solid',
							],
							'color' => [
								'type' => 'select',
								'label' => 'Color',
								'options' => [
									['value' => 'gray', 'label' => 'Gray'],
									['value' => 'black', 'label' => 'Black'],
									['value' => 'primary', 'label' => 'Primary'],
									['value' => 'secondary', 'label' => 'Secondary'],
									['value' => 'success', 'label' => 'Success'],
									['value' => 'danger', 'label' => 'Danger'],
									['value' => 'warning', 'label' => 'Warning'],
									['value' => 'info', 'label' => 'Info'],
								],
								'default' => 'gray',
							],
							'width' => [
								'type' => 'select',
								'label' => 'Width',
								'options' => [
									['value' => 'full', 'label' => 'Full Width'],
									['value' => '3/4', 'label' => '75%'],
									['value' => '1/2', 'label' => '50%'],
									['value' => '1/4', 'label' => '25%'],
								],
								'default' => 'full',
							],
							'thickness' => [
								'type' => 'select',
								'label' => 'Thickness',
								'options' => [
									['value' => 'thin', 'label' => 'Thin'],
									['value' => 'medium', 'label' => 'Medium'],
									['value' => 'thick', 'label' => 'Thick'],
								],
								'default' => 'thin',
							],
							'margin' => [
								'type' => 'select',
								'label' => 'Margin',
								'options' => [
									['value' => 'small', 'label' => 'Small'],
									['value' => 'normal', 'label' => 'Normal'],
									['value' => 'large', 'label' => 'Large'],
									['value' => 'xlarge', 'label' => 'Extra Large'],
								],
								'default' => 'normal',
							],
						],
					]),
					'template' => <<<'EOT'
                <hr className={`divider-component border-${props.style} border-${props.color} w-${props.width} border-${props.thickness} my-${props.margin}`} />
EOT,
				],
				[
					'name' => 'Tailwind Hero',
					'slug' => 'tailwindhero',
					'description' => 'Modern hero section with title, subtitle, content, and button.',
					'category' => 'layout',
					'icon' => 'hero',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'title' => [
								'type' => 'text',
								'label' => 'Title',
								'placeholder' => 'Enter title',
								'default' => 'Build Something Amazing',
							],
							'subtitle' => [
								'type' => 'text',
								'label' => 'Subtitle',
								'placeholder' => 'Enter subtitle',
								'default' => 'This is a hero component with customizable content',
							],
							'content' => [
								'type' => 'rich-text',
								'label' => 'Content',
								'default' => '<p>Add your compelling copy here. This hero section is perfect for making a strong first impression and driving conversions.</p>',
							],
							'buttonText' => [
								'type' => 'text',
								'label' => 'Button Text',
								'placeholder' => 'Enter button text',
								'default' => 'Get Started',
							],
							'buttonLink' => [
								'type' => 'text',
								'label' => 'Button Link',
								'placeholder' => 'Enter button URL',
								'default' => '#',
							],
							'buttonStyle' => [
								'type' => 'select',
								'label' => 'Button Style',
								'options' => [
									['value' => 'primary', 'label' => 'Primary'],
									['value' => 'secondary', 'label' => 'Secondary'],
									['value' => 'outline', 'label' => 'Outline'],
									['value' => 'dark', 'label' => 'Dark'],
									['value' => 'light', 'label' => 'Light'],
								],
								'default' => 'primary',
							],
							'alignment' => [
								'type' => 'select',
								'label' => 'Content Alignment',
								'options' => [
									['value' => 'left', 'label' => 'Left'],
									['value' => 'center', 'label' => 'Center'],
									['value' => 'right', 'label' => 'Right'],
								],
								'default' => 'left',
							],
							'backgroundColor' => [
								'type' => 'select',
								'label' => 'Background Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'light', 'label' => 'Light Gray'],
									['value' => 'dark', 'label' => 'Dark'],
									['value' => 'primary', 'label' => 'Primary Blue'],
									['value' => 'gradient-blue', 'label' => 'Blue Gradient'],
									['value' => 'gradient-green', 'label' => 'Green Gradient'],
								],
								'default' => 'white',
							],
							'textColor' => [
								'type' => 'select',
								'label' => 'Text Color',
								'options' => [
									['value' => 'gray-900', 'label' => 'Dark'],
									['value' => 'white', 'label' => 'White'],
									['value' => 'blue-600', 'label' => 'Blue'],
									['value' => 'purple-600', 'label' => 'Purple'],
								],
								'default' => 'gray-900',
							],
						],
					]),
					'template' => <<<'EOT'
                <section className={`py-20 ${props.backgroundColor === 'dark' ? 'bg-gray-900' : props.backgroundColor === 'light' ? 'bg-gray-50' : props.backgroundColor === 'primary' ? 'bg-blue-600' : 'bg-white'}`}>
                  <div className="container mx-auto px-4">
                    <div className={`flex justify-${props.alignment || 'start'}`}>
                      <div className={`w-full max-w-3xl text-${props.alignment || 'left'}`}>
                        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-${props.textColor || 'gray-900'}`}>
                          {props.title}
                        </h1>
                        <h2 className="text-xl md:text-2xl font-medium mb-6 text-gray-600">
                          {props.subtitle}
                        </h2>
                        <div className="prose mb-8 text-gray-600" dangerouslySetInnerHTML={{ __html: props.content }} />
                        <a
                          href={props.buttonLink}
                          className={`inline-block py-3 px-8 rounded-full font-medium bg-blue-600 text-white hover:bg-blue-700`}
                        >
                          {props.buttonText}
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
EOT,
				],
				[
					'name' => 'Video Hero',
					'slug' => 'videohero',
					'description' => 'Hero section with background video and customizable content.',
					'category' => 'layout',
					'icon' => 'video',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'title' => [
								'type' => 'text',
								'label' => 'Title',
								'placeholder' => 'Enter title',
								'default' => 'Captivating Video Background',
							],
							'subtitle' => [
								'type' => 'text',
								'label' => 'Subtitle',
								'placeholder' => 'Enter subtitle',
								'default' => 'Engage your visitors with dynamic content',
							],
							'content' => [
								'type' => 'rich-text',
								'label' => 'Content',
								'default' => '<p>This hero section features a background video that instantly grabs attention and showcases your brand in a dynamic way.</p>',
							],
							'buttonText' => [
								'type' => 'text',
								'label' => 'Primary Button Text',
								'placeholder' => 'Enter button text',
								'default' => 'Get Started',
							],
							'buttonLink' => [
								'type' => 'text',
								'label' => 'Primary Button Link',
								'placeholder' => 'Enter button URL',
								'default' => '#',
							],
							'buttonSecondaryText' => [
								'type' => 'text',
								'label' => 'Secondary Button Text',
								'placeholder' => 'Enter secondary button text',
								'default' => 'Learn More',
							],
							'buttonSecondaryLink' => [
								'type' => 'text',
								'label' => 'Secondary Button Link',
								'placeholder' => 'Enter secondary button URL',
								'default' => '#',
							],
							'videoSrc' => [
								'type' => 'media',
								'label' => 'Background Video',
								'accept' => 'video/mp4',
								'default' => '',
								'description' => 'Upload an MP4 video (recommended: short, compressed, no audio)',
							],
							'overlayOpacity' => [
								'type' => 'select',
								'label' => 'Overlay Opacity',
								'options' => [
									['value' => '30', 'label' => 'Light (30%)'],
									['value' => '50', 'label' => 'Medium (50%)'],
									['value' => '70', 'label' => 'Dark (70%)'],
									['value' => '90', 'label' => 'Very Dark (90%)'],
								],
								'default' => '50',
							],
							'alignment' => [
								'type' => 'select',
								'label' => 'Content Alignment',
								'options' => [
									['value' => 'left', 'label' => 'Left'],
									['value' => 'center', 'label' => 'Center'],
									['value' => 'right', 'label' => 'Right'],
								],
								'default' => 'left',
							],
							'textColor' => [
								'type' => 'select',
								'label' => 'Text Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'gray-900', 'label' => 'Dark'],
									['value' => 'blue-600', 'label' => 'Blue'],
								],
								'default' => 'white',
							],
						],
					]),
					'template' => <<<'EOT'
                <section className="relative overflow-hidden">
                  <div className="absolute inset-0 w-full h-full z-0">
                    <video className="absolute w-full h-full object-cover" autoPlay loop muted playsInline>
                      <source src={props.videoSrc} type="video/mp4" />
                    </video>
                    <div className={`absolute inset-0 bg-black bg-opacity-${props.overlayOpacity || '50'}`}></div>
                  </div>
                  <div className="relative z-10 py-20 md:py-32">
                    <div className="container mx-auto px-4">
                      <div className={`flex justify-${props.alignment || 'start'}`}>
                        <div className={`w-full max-w-3xl text-${props.alignment || 'left'}`}>
                          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-${props.textColor || 'white'}`}>
                            {props.title}
                          </h1>
                          <h2 className="text-xl md:text-2xl font-medium mb-6 text-gray-200">
                            {props.subtitle}
                          </h2>
                          <div className="prose text-gray-200 mb-8" dangerouslySetInnerHTML={{ __html: props.content }} />
                          <div className="flex flex-wrap gap-4">
                            <a href={props.buttonLink} className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full font-medium">
                              {props.buttonText}
                            </a>
                            <a href={props.buttonSecondaryLink} className="bg-white hover:bg-gray-100 text-gray-900 py-3 px-8 rounded-full font-medium">
                              {props.buttonSecondaryText}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
EOT,
				],
				[
					'name' => 'Pricing Table',
					'slug' => 'pricing',
					'description' => 'Pricing table with customizable plans and features.',
					'category' => 'sections',
					'icon' => 'pricing',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'title' => [
								'type' => 'text',
								'label' => 'Section Title',
								'placeholder' => 'Enter section title',
								'default' => 'Simple, Transparent Pricing',
							],
							'subtitle' => [
								'type' => 'text',
								'label' => 'Section Subtitle',
								'placeholder' => 'Enter section subtitle',
								'default' => 'Choose the plan that works best for your needs.',
							],
							'backgroundColor' => [
								'type' => 'select',
								'label' => 'Background Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'light', 'label' => 'Light Gray'],
									['value' => 'dark', 'label' => 'Dark'],
									['value' => 'primary', 'label' => 'Primary Blue'],
								],
								'default' => 'white',
							],
							'pricingPlans' => [
								'type' => 'array',
								'label' => 'Pricing Plans',
								'description' => 'Add your pricing plans',
								'default' => [
									[
										'title' => 'Basic',
										'price' => '$29',
										'period' => '/month',
										'description' => 'Perfect for individuals and small projects.',
										'features' => [
											'Up to 5 projects',
											'20GB storage',
											'Basic support',
											'Access to all basic features'
										],
										'buttonText' => 'Get Started',
										'buttonLink' => '#',
										'isPopular' => false,
										'style' => ''
									],
									[
										'title' => 'Pro',
										'price' => '$79',
										'period' => '/month',
										'description' => 'Ideal for growing businesses and teams.',
										'features' => [
											'Up to 15 projects',
											'50GB storage',
											'Priority support',
											'Access to all pro features',
											'Advanced analytics',
											'Team collaboration tools'
										],
										'buttonText' => 'Get Started',
										'buttonLink' => '#',
										'isPopular' => true,
										'style' => 'primary'
									],
									[
										'title' => 'Enterprise',
										'price' => '$149',
										'period' => '/month',
										'description' => 'Advanced features for larger organizations.',
										'features' => [
											'Unlimited projects',
											'100GB storage',
											'24/7 dedicated support',
											'Access to all enterprise features',
											'Advanced security',
											'Custom integrations',
											'Dedicated account manager'
										],
										'buttonText' => 'Contact Sales',
										'buttonLink' => '#',
										'isPopular' => false,
										'style' => 'dark'
									]
								],
								'template' => [
									'title' => 'Plan Title',
									'price' => '$XX',
									'period' => '/month',
									'description' => 'Plan description',
									'features' => [],
									'buttonText' => 'Get Started',
									'buttonLink' => '#',
									'isPopular' => false,
									'style' => ''
								]
							],
						],
					]),
					'template' => <<<'EOT'
                <section className={`py-20 ${props.backgroundColor === 'dark' ? 'bg-gray-900' : props.backgroundColor === 'light' ? 'bg-gray-50' : props.backgroundColor === 'primary' ? 'bg-blue-600' : 'bg-white'}`}>
                  <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${props.backgroundColor === 'dark' ? 'text-white' : props.backgroundColor === 'primary' ? 'text-white' : 'text-gray-900'}`}>
                        {props.title}
                      </h2>
                      <p className={`text-xl max-w-3xl mx-auto ${props.backgroundColor === 'dark' ? 'text-gray-300' : props.backgroundColor === 'primary' ? 'text-gray-100' : 'text-gray-600'}`}>
                        {props.subtitle}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {/* Pricing cards would be rendered here */}
                    </div>
                  </div>
                </section>
EOT,
				],
				[
					'name' => 'Team Grid',
					'slug' => 'team',
					'description' => 'Display your team members in a responsive grid layout.',
					'category' => 'sections',
					'icon' => 'team',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'title' => [
								'type' => 'text',
								'label' => 'Section Title',
								'placeholder' => 'Enter section title',
								'default' => 'Meet Our Team',
							],
							'subtitle' => [
								'type' => 'text',
								'label' => 'Section Subtitle',
								'placeholder' => 'Enter section subtitle',
								'default' => 'We\'re a group of dedicated professionals passionate about what we do.',
							],
							'backgroundColor' => [
								'type' => 'select',
								'label' => 'Background Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'light', 'label' => 'Light Gray'],
									['value' => 'dark', 'label' => 'Dark'],
									['value' => 'primary', 'label' => 'Primary Blue'],
								],
								'default' => 'white',
							],
							'columns' => [
								'type' => 'select',
								'label' => 'Number of Columns',
								'options' => [
									['value' => '1', 'label' => '1 Column'],
									['value' => '2', 'label' => '2 Columns'],
									['value' => '3', 'label' => '3 Columns'],
									['value' => '4', 'label' => '4 Columns'],
								],
								'default' => '3',
							],
							'teamMembers' => [
								'type' => 'array',
								'label' => 'Team Members',
								'description' => 'Add your team members',
								'default' => [
									[
										'name' => 'John Doe',
										'position' => 'CEO & Founder',
										'bio' => 'John has over 15 years of experience in the industry and leads our strategic vision.',
										'imageSrc' => '',
										'socialLinks' => [
											[
												'platform' => 'LinkedIn',
												'url' => '#',
												'icon' => 'fab fa-linkedin-in'
											],
											[
												'platform' => 'Twitter',
												'url' => '#',
												'icon' => 'fab fa-twitter'
											]
										]
									],
									[
										'name' => 'Jane Smith',
										'position' => 'Lead Designer',
										'bio' => 'Jane brings creative vision to all our projects with her exceptional design skills.',
										'imageSrc' => '',
										'socialLinks' => [
											[
												'platform' => 'LinkedIn',
												'url' => '#',
												'icon' => 'fab fa-linkedin-in'
											],
											[
												'platform' => 'Dribbble',
												'url' => '#',
												'icon' => 'fab fa-dribbble'
											]
										]
									],
									[
										'name' => 'Michael Johnson',
										'position' => 'Lead Developer',
										'bio' => 'Michael ensures our code is clean, efficient, and meets the highest standards.',
										'imageSrc' => '',
										'socialLinks' => [
											[
												'platform' => 'LinkedIn',
												'url' => '#',
												'icon' => 'fab fa-linkedin-in'
											],
											[
												'platform' => 'GitHub',
												'url' => '#',
												'icon' => 'fab fa-github'
											]
										]
									]
								],
								'template' => [
									'name' => 'Team Member Name',
									'position' => 'Position/Title',
									'bio' => 'Short bio description',
									'imageSrc' => '',
									'socialLinks' => []
								]
							],
						],
					]),
					'template' => <<<'EOT'
                <section className={`py-20 ${props.backgroundColor === 'dark' ? 'bg-gray-900' : props.backgroundColor === 'light' ? 'bg-gray-50' : props.backgroundColor === 'primary' ? 'bg-blue-600' : 'bg-white'}`}>
                  <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${props.backgroundColor === 'dark' ? 'text-white' : props.backgroundColor === 'primary' ? 'text-white' : 'text-gray-900'}`}>
                        {props.title}
                      </h2>
                      <p className={`text-xl max-w-3xl mx-auto ${props.backgroundColor === 'dark' ? 'text-gray-300' : props.backgroundColor === 'primary' ? 'text-gray-100' : 'text-gray-600'}`}>
                        {props.subtitle}
                      </p>
                    </div>
                    <div className={`grid grid-cols-1 ${props.columns === '2' ? 'md:grid-cols-2' : props.columns === '3' ? 'md:grid-cols-2 lg:grid-cols-3' : props.columns === '4' ? 'md:grid-cols-2 lg:grid-cols-4' : ''}`} gap-8>
                      {/* Team member cards would be rendered here */}
                    </div>
                  </div>
                </section>
EOT,
				],
				[
					'name' => 'Portfolio Grid',
					'slug' => 'portfolio',
					'description' => 'Display your projects or portfolio items in a responsive grid.',
					'category' => 'sections',
					'icon' => 'portfolio',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'title' => [
								'type' => 'text',
								'label' => 'Section Title',
								'placeholder' => 'Enter section title',
								'default' => 'Our Portfolio',
							],
							'subtitle' => [
								'type' => 'text',
								'label' => 'Section Subtitle',
								'placeholder' => 'Enter section subtitle',
								'default' => 'Check out some of our recent work that showcases our expertise.',
							],
							'backgroundColor' => [
								'type' => 'select',
								'label' => 'Background Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'light', 'label' => 'Light Gray'],
									['value' => 'dark', 'label' => 'Dark'],
									['value' => 'primary', 'label' => 'Primary Blue'],
								],
								'default' => 'white',
							],
							'columns' => [
								'type' => 'select',
								'label' => 'Number of Columns',
								'options' => [
									['value' => '1', 'label' => '1 Column'],
									['value' => '2', 'label' => '2 Columns'],
									['value' => '3', 'label' => '3 Columns'],
									['value' => '4', 'label' => '4 Columns'],
								],
								'default' => '2',
							],
							'portfolioItems' => [
								'type' => 'array',
								'label' => 'Portfolio Items',
								'description' => 'Add your projects or portfolio items',
								'default' => [
									[
										'title' => 'Project One',
										'description' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis semper ante at lectus iaculis, vel lacinia metus ornare.',
										'imageSrc' => '',
										'tags' => [
											[
												'text' => 'Web Design',
												'color' => 'blue'
											],
											[
												'text' => 'React',
												'color' => 'purple'
											]
										],
										'linkText' => 'View Project',
										'linkUrl' => '#'
									],
									[
										'title' => 'Project Two',
										'description' => 'Vivamus vitae suscipit justo. Cras aliquam rhoncus libero eget cursus. Nullam ante magna, accumsan a purus et, mattis mattis nisl.',
										'imageSrc' => '',
										'tags' => [
											[
												'text' => 'Mobile',
												'color' => 'green'
											],
											[
												'text' => 'iOS',
												'color' => 'blue'
											]
										],
										'linkText' => 'View Project',
										'linkUrl' => '#'
									]
								],
								'template' => [
									'title' => 'Project Title',
									'description' => 'Project description',
									'imageSrc' => '',
									'tags' => [],
									'linkText' => 'View Project',
									'linkUrl' => '#'
								]
							],
						],
					]),
					'template' => <<<'EOT'
                <section className={`py-20 ${props.backgroundColor === 'dark' ? 'bg-gray-900' : props.backgroundColor === 'light' ? 'bg-gray-50' : props.backgroundColor === 'primary' ? 'bg-blue-600' : 'bg-white'}`}>
                  <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${props.backgroundColor === 'dark' ? 'text-white' : props.backgroundColor === 'primary' ? 'text-white' : 'text-gray-900'}`}>
                        {props.title}
                      </h2>
                      <p className={`text-xl max-w-3xl mx-auto ${props.backgroundColor === 'dark' ? 'text-gray-300' : props.backgroundColor === 'primary' ? 'text-gray-100' : 'text-gray-600'}`}>
                        {props.subtitle}
                      </p>
                    </div>
                    <div className={`grid grid-cols-1 ${props.columns === '2' ? 'md:grid-cols-2' : props.columns === '3' ? 'md:grid-cols-3' : props.columns === '4' ? 'md:grid-cols-4' : ''}`} gap-10>
                      {/* Portfolio item cards would be rendered here */}
                    </div>
                  </div>
                </section>
EOT,
				],
				[
					'name' => 'Process Steps',
					'slug' => 'process',
					'description' => 'Display your process or workflow steps in a visually appealing way.',
					'category' => 'sections',
					'icon' => 'process',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'title' => [
								'type' => 'text',
								'label' => 'Section Title',
								'placeholder' => 'Enter section title',
								'default' => 'Our Process',
							],
							'subtitle' => [
								'type' => 'text',
								'label' => 'Section Subtitle',
								'placeholder' => 'Enter section subtitle',
								'default' => 'Here\'s how we work with you to achieve outstanding results.',
							],
							'backgroundColor' => [
								'type' => 'select',
								'label' => 'Background Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'gray-50', 'label' => 'Light Gray'],
									['value' => 'gray-100', 'label' => 'Medium Gray'],
									['value' => 'blue-50', 'label' => 'Light Blue'],
									['value' => 'dark', 'label' => 'Dark'],
								],
								'default' => 'gray-50',
							],
							'layout' => [
								'type' => 'select',
								'label' => 'Layout Style',
								'options' => [
									['value' => 'grid', 'label' => 'Grid Layout'],
									['value' => 'timeline', 'label' => 'Timeline Layout'],
								],
								'default' => 'grid',
							],
							'steps' => [
								'type' => 'array',
								'label' => 'Process Steps',
								'description' => 'Add the steps in your process',
								'default' => [
									[
										'title' => 'Discovery',
										'description' => 'We start by understanding your vision, business goals, and user needs.',
										'icon' => 'fas fa-search'
									],
									[
										'title' => 'Planning',
										'description' => 'Together, we define the scope, features, and timeline of your project.',
										'icon' => 'fas fa-clipboard-list'
									],
									[
										'title' => 'Design',
										'description' => 'Our design team creates intuitive user interfaces and experiences.',
										'icon' => 'fas fa-pencil-ruler'
									],
									[
										'title' => 'Development',
										'description' => 'Our developers write clean, efficient code, sharing progress regularly.',
										'icon' => 'fas fa-code'
									],
									[
										'title' => 'Testing',
										'description' => 'We rigorously test your app for functionality and user experience.',
										'icon' => 'fas fa-check-circle'
									],
									[
										'title' => 'Launch',
										'description' => 'We handle the deployment process to ensure a successful launch.',
										'icon' => 'fas fa-rocket'
									]
								],
								'template' => [
									'title' => 'Step Title',
									'description' => 'Step description',
									'icon' => 'fas fa-star'
								]
							],
						],
					]),
					'template' => <<<'EOT'
                <section className={`py-20 ${props.backgroundColor === 'dark' ? 'bg-gray-900' : props.backgroundColor === 'gray-50' ? 'bg-gray-50' : props.backgroundColor === 'gray-100' ? 'bg-gray-100' : props.backgroundColor === 'blue-50' ? 'bg-blue-50' : 'bg-white'}`}>
                  <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${props.backgroundColor === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {props.title}
                      </h2>
                      <p className={`text-xl max-w-3xl mx-auto ${props.backgroundColor === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {props.subtitle}
                      </p>
                    </div>

                    {/* Process steps would be rendered here based on layout */}
                  </div>
                </section>
EOT,
				],
				[
					'name' => 'Statistics',
					'slug' => 'stats',
					'description' => 'Display key metrics and statistics in a clean, modern layout.',
					'category' => 'sections',
					'icon' => 'stats',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'backgroundColor' => [
								'type' => 'select',
								'label' => 'Background Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'gray-50', 'label' => 'Light Gray'],
									['value' => 'blue-600', 'label' => 'Blue'],
									['value' => 'blue-700', 'label' => 'Dark Blue'],
									['value' => 'purple-600', 'label' => 'Purple'],
									['value' => 'dark', 'label' => 'Dark'],
									['value' => 'gradient-blue', 'label' => 'Blue Gradient'],
									['value' => 'gradient-purple', 'label' => 'Purple Gradient'],
								],
								'default' => 'blue-600',
							],
							'textColor' => [
								'type' => 'select',
								'label' => 'Text Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'gray-900', 'label' => 'Dark'],
									['value' => 'blue-600', 'label' => 'Blue'],
								],
								'default' => 'white',
							],
							'columns' => [
								'type' => 'select',
								'label' => 'Number of Columns',
								'options' => [
									['value' => '2', 'label' => '2 Columns'],
									['value' => '3', 'label' => '3 Columns'],
									['value' => '4', 'label' => '4 Columns'],
								],
								'default' => '4',
							],
							'stats' => [
								'type' => 'array',
								'label' => 'Statistics',
								'description' => 'Add your key metrics and statistics',
								'default' => [
									[
										'value' => '100%',
										'label' => 'Client Satisfaction'
									],
									[
										'value' => '50+',
										'label' => 'Projects Completed'
									],
									[
										'value' => '10+',
										'label' => 'Years Experience'
									],
									[
										'value' => '24/7',
										'label' => 'Support'
									]
								],
								'template' => [
									'value' => '0',
									'label' => 'Statistic Label'
								]
							],
						],
					]),
					'template' => <<<'EOT'
                <section className={`py-16 ${props.backgroundColor === 'dark' ? 'bg-gray-900' : props.backgroundColor === 'blue-600' ? 'bg-blue-600' : props.backgroundColor === 'blue-700' ? 'bg-blue-700' : props.backgroundColor === 'purple-600' ? 'bg-purple-600' : props.backgroundColor === 'gradient-blue' ? 'bg-gradient-to-r from-blue-600 to-blue-800' : props.backgroundColor === 'gradient-purple' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : props.backgroundColor === 'gray-50' ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="container mx-auto px-4">
                    <div className={`grid ${props.columns === '2' ? 'grid-cols-1 sm:grid-cols-2' : props.columns === '3' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`} gap-8 text-center>
                      {/* Stats would be rendered here */}
                    </div>
                  </div>
                </section>
EOT,
				],
				[
					'name' => 'Testimonials',
					'slug' => 'testimonials',
					'description' => 'Display client testimonials and reviews in a clean, modern layout.',
					'category' => 'sections',
					'icon' => 'testimonials',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'title' => [
								'type' => 'text',
								'label' => 'Section Title',
								'placeholder' => 'Enter section title',
								'default' => 'What Our Clients Say',
							],
							'subtitle' => [
								'type' => 'text',
								'label' => 'Section Subtitle',
								'placeholder' => 'Enter section subtitle',
								'default' => 'Don\'t just take our word for it. Here\'s what others have to say about working with us.',
							],
							'backgroundColor' => [
								'type' => 'select',
								'label' => 'Background Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'gray-50', 'label' => 'Light Gray'],
									['value' => 'gray-100', 'label' => 'Medium Gray'],
									['value' => 'blue-50', 'label' => 'Light Blue'],
									['value' => 'dark', 'label' => 'Dark'],
								],
								'default' => 'gray-50',
							],
							'columns' => [
								'type' => 'select',
								'label' => 'Number of Columns',
								'options' => [
									['value' => '1', 'label' => '1 Column'],
									['value' => '2', 'label' => '2 Columns'],
								],
								'default' => '2',
							],
							'style' => [
								'type' => 'select',
								'label' => 'Display Style',
								'options' => [
									['value' => 'card', 'label' => 'Card Style'],
									['value' => 'minimal', 'label' => 'Minimal Style'],
								],
								'default' => 'card',
							],
							'testimonials' => [
								'type' => 'array',
								'label' => 'Testimonials',
								'description' => 'Add client testimonials',
								'default' => [
									[
										'content' => 'Working with this team was the best decision we made for our project. Their expertise and dedication exceeded our expectations. Highly recommended!',
										'name' => 'John Smith',
										'title' => 'CEO, Company Inc.',
										'avatar' => ''
									],
									[
										'content' => 'The attention to detail and quality of work was impressive. They delivered on time and were responsive throughout the entire process.',
										'name' => 'Sarah Johnson',
										'title' => 'Marketing Director, Brand Co.',
										'avatar' => ''
									],
									[
										'content' => 'They understood our requirements perfectly and transformed our vision into reality. The end result was exactly what we needed.',
										'name' => 'David Wilson',
										'title' => 'Product Manager, Tech Solutions',
										'avatar' => ''
									],
									[
										'content' => 'Professional, creative, and incredibly skilled. They went above and beyond to ensure we were satisfied with the final product.',
										'name' => 'Emily Brown',
										'title' => 'Creative Director, Design Studio',
										'avatar' => ''
									]
								],
								'template' => [
									'content' => 'Testimonial content goes here',
									'name' => 'Client Name',
									'title' => 'Position, Company',
									'avatar' => ''
								]
							],
						],
					]),
					'template' => <<<'EOT'
                <section className={`py-20 ${props.backgroundColor === 'dark' ? 'bg-gray-900' : props.backgroundColor === 'gray-50' ? 'bg-gray-50' : props.backgroundColor === 'gray-100' ? 'bg-gray-100' : props.backgroundColor === 'blue-50' ? 'bg-blue-50' : 'bg-white'}`}>
                  <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${props.backgroundColor === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {props.title}
                      </h2>
                      <p className={`text-xl max-w-3xl mx-auto ${props.backgroundColor === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {props.subtitle}
                      </p>
                    </div>

                    {/* Testimonials would be rendered here based on style */}
                  </div>
                </section>
EOT,
				],
				[
					'name' => 'Call to Action',
					'slug' => 'calltoaction',
					'description' => 'Compelling call-to-action section to drive user engagement.',
					'category' => 'sections',
					'icon' => 'calltoaction',
					'is_system' => true,
					'is_active' => true,
					'schema' => json_encode([
						'properties' => [
							'title' => [
								'type' => 'text',
								'label' => 'Title',
								'placeholder' => 'Enter title',
								'default' => 'Ready to Get Started?',
							],
							'subtitle' => [
								'type' => 'text',
								'label' => 'Subtitle',
								'placeholder' => 'Enter subtitle',
								'default' => 'Join thousands of satisfied customers who are already using our services.',
							],
							'buttonText' => [
								'type' => 'text',
								'label' => 'Button Text',
								'placeholder' => 'Enter button text',
								'default' => 'Get Started Now',
							],
							'buttonLink' => [
								'type' => 'text',
								'label' => 'Button Link',
								'placeholder' => 'Enter button link',
								'default' => '#',
							],
							'backgroundColor' => [
								'type' => 'select',
								'label' => 'Background Color',
								'options' => [
									['value' => 'white', 'label' => 'White'],
									['value' => 'gray-50', 'label' => 'Light Gray'],
									['value' => 'gray-900', 'label' => 'Dark'],
									['value' => 'blue-600', 'label' => 'Blue'],
									['value' => 'gradient-blue', 'label' => 'Blue Gradient'],
								],
								'default' => 'gray-900',
							],
							'alignment' => [
								'type' => 'select',
								'label' => 'Content Alignment',
								'options' => [
									['value' => 'left', 'label' => 'Left'],
									['value' => 'center', 'label' => 'Center'],
									['value' => 'right', 'label' => 'Right'],
								],
								'default' => 'center',
							],
						],
					]),
					'template' => <<<'EOT'
                <section className={`py-16 ${props.backgroundColor === 'white' ? 'bg-white' : props.backgroundColor === 'gray-50' ? 'bg-gray-50' : props.backgroundColor === 'gray-900' ? 'bg-gray-900' : props.backgroundColor === 'blue-600' ? 'bg-blue-600' : props.backgroundColor === 'gradient-blue' ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gray-900'}`}>
                  <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className={`text-${props.alignment || 'center'}`}>
                      <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${props.backgroundColor === 'white' || props.backgroundColor === 'gray-50' ? 'text-gray-900' : 'text-white'}`}>
                        {props.title}
                      </h2>
                      <p className={`text-xl max-w-3xl mx-auto mb-8 ${props.backgroundColor === 'white' || props.backgroundColor === 'gray-50' ? 'text-gray-600' : 'text-gray-300'}`}>
                        {props.subtitle}
                      </p>
                      <a
                        href={props.buttonLink}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-10 rounded-full font-medium text-lg transition duration-300 inline-block"
                      >
                        {props.buttonText}
                      </a>
                    </div>
                  </div>
                </section>
EOT,
				],
			];
			
			foreach ($components as $component) {
				Component::create($component);
			}
		}
	}
