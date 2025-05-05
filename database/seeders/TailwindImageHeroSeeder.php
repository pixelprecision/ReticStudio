<?php
// database/seeders/TailwindImageHeroSeeder.php

namespace Database\Seeders;

use App\Models\Component;
use Illuminate\Database\Seeder;

class TailwindImageHeroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if component already exists
        $existingComponent = \App\Models\Component::where('slug', 'tailwindimagehero')->first();
        
        // Component data
        $component = [
            'name' => 'Tailwind Image Hero',
            'slug' => 'tailwindimagehero',
            'description' => 'Modern hero section with background image, customizable overlay, and optional side image.',
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
                        'default' => 'This is a hero component with background image and customizable overlay',
                    ],
                    'content' => [
                        'type' => 'rich-text',
                        'label' => 'Content',
                        'default' => '<p>Add your compelling copy here. This hero section is perfect for making a strong first impression with a beautiful background image.</p>',
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
                        'label' => 'Background Color (when no image)',
                        'options' => [
                            ['value' => 'white', 'label' => 'White'],
                            ['value' => 'light', 'label' => 'Light Gray'],
                            ['value' => 'dark', 'label' => 'Dark'],
                            ['value' => 'primary', 'label' => 'Primary Blue'],
                            ['value' => 'secondary', 'label' => 'Secondary Purple'],
                            ['value' => 'gradient-blue', 'label' => 'Blue Gradient'],
                            ['value' => 'gradient-green', 'label' => 'Green Gradient'],
                        ],
                        'default' => 'dark',
                    ],
                    'backgroundImage' => [
                        'type' => 'media',
                        'label' => 'Background Image',
                        'accept' => 'image/*',
                        'default' => '',
                        'description' => 'Upload an image for the background',
                    ],
                    'overlayColor' => [
                        'type' => 'select',
                        'label' => 'Overlay Color',
                        'options' => [
                            ['value' => 'black', 'label' => 'Black'],
                            ['value' => 'white', 'label' => 'White'],
                            ['value' => 'blue', 'label' => 'Blue'],
                            ['value' => 'purple', 'label' => 'Purple'],
                            ['value' => 'green', 'label' => 'Green'],
                            ['value' => 'red', 'label' => 'Red'],
                        ],
                        'default' => 'black',
                    ],
                    'overlayOpacity' => [
                        'type' => 'select',
                        'label' => 'Overlay Opacity',
                        'options' => [
                            ['value' => '0', 'label' => 'None (0%)'],
                            ['value' => '10', 'label' => 'Very Light (10%)'],
                            ['value' => '20', 'label' => 'Light (20%)'],
                            ['value' => '30', 'label' => 'Light (30%)'],
                            ['value' => '40', 'label' => 'Medium (40%)'],
                            ['value' => '50', 'label' => 'Medium (50%)'],
                            ['value' => '60', 'label' => 'Medium-Dark (60%)'],
                            ['value' => '70', 'label' => 'Dark (70%)'],
                            ['value' => '80', 'label' => 'Dark (80%)'],
                            ['value' => '90', 'label' => 'Very Dark (90%)'],
                            ['value' => '100', 'label' => 'Solid (100%)'],
                        ],
                        'default' => '50',
                    ],
                    'parallaxEnabled' => [
                        'type' => 'boolean',
                        'label' => 'Enable Parallax Effect',
                        'description' => 'Adds a subtle parallax scrolling effect to the background image',
                        'default' => false,
                    ],
                    'parallaxSpeed' => [
                        'type' => 'select',
                        'label' => 'Parallax Speed',
                        'description' => 'Controls how fast the parallax effect moves (higher values = more dramatic effect)',
                        'options' => [
                            ['value' => '0.1', 'label' => 'Very Subtle'],
                            ['value' => '0.3', 'label' => 'Subtle'],
                            ['value' => '0.5', 'label' => 'Medium'],
                            ['value' => '0.7', 'label' => 'Noticeable'],
                            ['value' => '1.0', 'label' => 'Dramatic'],
                        ],
                        'default' => '0.5',
                    ],
                    'sideImage' => [
                        'type' => 'media',
                        'label' => 'Side Image',
                        'accept' => 'image/*',
                        'default' => '',
                        'description' => 'Upload an image to display beside the content',
                    ],
                    'sideImagePosition' => [
                        'type' => 'select',
                        'label' => 'Side Image Position',
                        'options' => [
                            ['value' => 'left', 'label' => 'Left'],
                            ['value' => 'right', 'label' => 'Right'],
                        ],
                        'default' => 'right',
                    ],
                    'sideImageWidth' => [
                        'type' => 'select',
                        'label' => 'Side Image Width',
                        'options' => [
                            ['value' => '30', 'label' => '30%'],
                            ['value' => '40', 'label' => '40%'],
                            ['value' => '50', 'label' => '50%'],
                            ['value' => '60', 'label' => '60%'],
                        ],
                        'default' => '40',
                    ],
                    'textColor' => [
                        'type' => 'select',
                        'label' => 'Text Color',
                        'options' => [
                            ['value' => 'white', 'label' => 'White'],
                            ['value' => 'gray-900', 'label' => 'Dark'],
                            ['value' => 'blue-600', 'label' => 'Blue'],
                            ['value' => 'purple-600', 'label' => 'Purple'],
                        ],
                        'default' => 'white',
                    ],
                    'extraClasses' => [
                        'type' => 'text',
                        'label' => 'Container Extra Classes',
                        'placeholder' => 'Additional Tailwind classes for container',
                        'default' => '',
                    ],
                    'imageExtraClasses' => [
                        'type' => 'text',
                        'label' => 'Image Extra Classes',
                        'placeholder' => 'Additional Tailwind classes for image area',
                        'default' => '',
                    ],
                    'textExtraClasses' => [
                        'type' => 'text',
                        'label' => 'Text Extra Classes',
                        'placeholder' => 'Additional Tailwind classes for text area',
                        'default' => '',
                    ],
                ],
            ]),
            'template' => <<<'EOT'
<section className={`relative overflow-hidden py-20 md:py-24 ${props.backgroundImage ? '' : props.backgroundColor === 'dark' ? 'bg-gray-900' : props.backgroundColor === 'light' ? 'bg-gray-50' : props.backgroundColor === 'primary' ? 'bg-blue-600' : props.backgroundColor === 'secondary' ? 'bg-purple-600' : props.backgroundColor === 'gradient-blue' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : props.backgroundColor === 'gradient-green' ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-white'} ${props.extraClasses || ''}`}>
  {props.backgroundImage && (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className={`w-full h-full ${props.parallaxEnabled ? 'absolute top-0 left-0' : ''}`}
          style={props.parallaxEnabled ? { 
            transform: 'translate3d(0, 0, 0)', /* Initial position to avoid gap */
            height: `calc(100% + ${parseInt(props.parallaxSpeed || 0.5) * 100}px)`,
            bottom: 'auto',
            top: '0',
            willChange: 'transform'
          } : {}}
          data-parallax={props.parallaxEnabled ? 'true' : 'false'}
          data-parallax-speed={props.parallaxSpeed || '0.5'}
        >
          <img 
            src={props.backgroundImage} 
            alt="Background" 
            className="w-full h-full object-cover" 
            style={{ 
              minHeight: props.parallaxEnabled ? '120%' : '100%',
              objectPosition: props.parallaxEnabled ? 'center top' : 'center center',
              objectFit: 'cover'
            }}
          />
        </div>
        <div 
          className={`absolute inset-0 ${props.overlayColor === 'black' ? 'bg-black' : props.overlayColor === 'white' ? 'bg-white' : props.overlayColor === 'blue' ? 'bg-blue-900' : props.overlayColor === 'purple' ? 'bg-purple-900' : props.overlayColor === 'green' ? 'bg-green-900' : props.overlayColor === 'red' ? 'bg-red-900' : 'bg-black'} bg-opacity-${props.overlayOpacity || '50'}`}
        ></div>
      </div>
    </>
  )}

  <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
    <div className={`flex flex-col ${props.sideImage ? (props.sideImagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row') : ''} gap-8`}>
      {/* Content section */}
      <div className={`${props.sideImage ? 'md:w-6/12 lg:w-7/12' : 'w-full'} flex ${props.alignment === 'left' ? 'justify-start' : props.alignment === 'center' ? 'justify-center' : props.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
        <div 
          className={`w-full max-w-3xl ${props.alignment === 'left' ? 'text-left' : props.alignment === 'center' ? 'text-center' : props.alignment === 'right' ? 'text-right' : 'text-left'} ${props.textExtraClasses || ''}`}
        >
          {props.title && (
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${props.textColor === 'white' ? 'text-white' : props.textColor === 'gray-900' ? 'text-gray-900' : props.textColor === 'blue-600' ? 'text-blue-600' : props.textColor === 'purple-600' ? 'text-purple-600' : 'text-white'}`}>
              {props.title}
            </h1>
          )}

          {props.subtitle && (
            <h2 className={`text-xl md:text-2xl font-medium mb-6 ${props.backgroundImage || props.backgroundColor === 'dark' || props.backgroundColor === 'gradient-blue' || props.backgroundColor === 'gradient-green' ? 'text-gray-300' : 'text-gray-600'}`}>
              {props.subtitle}
            </h2>
          )}

          {props.content && (
            <div
              className={`prose max-w-none mb-8 ${props.backgroundImage || props.backgroundColor === 'dark' || props.backgroundColor === 'gradient-blue' || props.backgroundColor === 'gradient-green' ? 'text-gray-300 prose-headings:text-white prose-a:text-blue-300' : 'text-gray-600'}`}
              dangerouslySetInnerHTML={{ __html: props.content }}
            />
          )}

          {props.buttonText && props.buttonLink && (
            <div className="mt-8">
              <a
                href={props.buttonLink}
                className={`inline-block py-3 px-8 rounded-full font-medium transition duration-300 ${
                  props.buttonStyle === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  props.buttonStyle === 'secondary' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                  props.buttonStyle === 'outline' ? 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50' :
                  props.buttonStyle === 'dark' ? 'bg-gray-900 hover:bg-gray-800 text-white' :
                  props.buttonStyle === 'light' ? 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200' :
                  'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {props.buttonText}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Side image section */}
      {props.sideImage && (
        <div 
          className={`md:w-5/12 lg:w-4/12 ${
            props.sideImageWidth === '30' ? 'md:w-3/10' :
            props.sideImageWidth === '40' ? 'md:w-4/10' :
            props.sideImageWidth === '50' ? 'md:w-1/2' :
            props.sideImageWidth === '60' ? 'md:w-6/10' :
            'md:w-4/10'
          } ${props.imageExtraClasses || ''}`}
        >
          <div className="rounded-lg overflow-hidden shadow-xl h-full">
            <img 
              src={props.sideImage} 
              alt="Featured" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  </div>
</section>
EOT,
        ];
        
        // If component exists, update it, otherwise create it
        if ($existingComponent) {
            $existingComponent->update($component);
            echo "Updated Tailwind Image Hero component with parallax features.\n";
        } else {
            Component::create($component);
            echo "Created new Tailwind Image Hero component.\n";
        }
    }
}