// resources/js/admin/src/components/pageRenderer/components/TailwindImageHeroComponent.jsx
import React, { useEffect, useRef } from 'react';
import { extractArbitraryStyles, processArbitraryClasses } from '../../../utils/tailwindUtils';
import { initElementParallax } from '../../../utils/parallaxUtils';

const TailwindImageHeroComponent = ({
  title,
  subtitle,
  content,
  buttonText,
  buttonLink,
  buttonStyle = 'primary',
  alignment = 'left',
  backgroundColor = 'white',
  overlayColor = 'black',
  overlayOpacity = '50',
  backgroundImage,
  parallaxEnabled = false,
  parallaxSpeed = '0.5',
  sideImage,
  sideImagePosition = 'right',
  sideImageWidth = '40',
  textColor = 'white',
  componentId,
  extraClasses = '',
  imageExtraClasses = '',
  textExtraClasses = ''
}) => {
  const parallaxRef = useRef(null);

  // Set up parallax effect using our utility
  useEffect(() => {
    let cleanup = null;

    if (parallaxEnabled && backgroundImage && parallaxRef.current) {
      // Ensure our container has enough height for parallax effect
      const speed = parseFloat(parallaxSpeed);
      const extraHeight = Math.max(speed * 100, 20); // At least 20% extra

      // Prepare the parallax container
      if (parallaxRef.current.parentElement) {
        parallaxRef.current.parentElement.style.overflow = 'hidden';
      }

      // Make the image large enough to cover during parallax
      const img = parallaxRef.current.querySelector('img');
      if (img) {
        img.style.minHeight = `calc(100% + ${extraHeight}%)`;
        img.style.objectPosition = 'center top'; // Anchor to top
        img.style.objectFit = 'cover';
      }
      
      // Set initial position explicitly to avoid the gap
      parallaxRef.current.style.transform = 'translate3d(0, 0, 0)';

      // Use our utility to initialize parallax with proper cleanup
      cleanup = initElementParallax(parallaxRef.current, speed);
    }

    // Return cleanup function
    return () => {
      if (cleanup) cleanup();
    };
  }, [parallaxEnabled, backgroundImage, parallaxSpeed]);
  // Background color classes
  const bgColorClasses = {
    'white': 'bg-white',
    'light': 'bg-gray-50',
    'dark': 'bg-gray-900',
    'primary': 'bg-blue-600',
    'secondary': 'bg-purple-600',
    'gradient-blue': 'bg-gradient-to-r from-blue-600 to-indigo-600',
    'gradient-green': 'bg-gradient-to-r from-green-500 to-teal-500'
  };

  // Text color classes
  const textColorClasses = {
    'white': 'text-white',
    'gray-900': 'text-gray-900',
    'gray-600': 'text-gray-600',
    'blue-600': 'text-blue-600',
    'purple-600': 'text-purple-600'
  };

  // Button style classes
  const buttonStyleClasses = {
    'primary': 'bg-blue-600 hover:bg-blue-700 text-white',
    'secondary': 'bg-purple-600 hover:bg-purple-700 text-white',
    'outline': 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    'dark': 'bg-gray-900 hover:bg-gray-800 text-white',
    'light': 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
  };

  // Text alignment classes
  const alignmentClasses = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right'
  };

  // Content alignment for the layout
  const contentAlignmentClasses = {
    'left': 'justify-start',
    'center': 'justify-center',
    'right': 'justify-end'
  };

  // Overlay opacity classes
  const overlayOpacityClasses = {
    '0': 'bg-opacity-0',
    '10': 'bg-opacity-10',
    '20': 'bg-opacity-20',
    '30': 'bg-opacity-30',
    '40': 'bg-opacity-40',
    '50': 'bg-opacity-50',
    '60': 'bg-opacity-60',
    '70': 'bg-opacity-70',
    '80': 'bg-opacity-80',
    '90': 'bg-opacity-90',
    '100': 'bg-opacity-100'
  };

  // Overlay color classes
  const overlayColorClasses = {
    'black': 'bg-black',
    'white': 'bg-white',
    'blue': 'bg-blue-900',
    'purple': 'bg-purple-900',
    'green': 'bg-green-900',
    'red': 'bg-red-900'
  };

  // Side image width classes
  const sideImageWidthClasses = {
    '30': 'md:w-3/10',
    '40': 'md:w-4/10',
    '50': 'md:w-1/2',
    '60': 'md:w-6/10'
  };

  // Function to create markup for HTML content
  const createMarkup = () => {
    return { __html: content };
  };

  // Process extraClasses to handle arbitrary Tailwind classes
  const { styles: containerStyles, remainingClasses: containerClasses } = extractArbitraryStyles(extraClasses);
  const processedContainerClasses = processArbitraryClasses(extraClasses);

  // Process imageExtraClasses
  const { styles: imageStyles, remainingClasses: imageClasses } = extractArbitraryStyles(imageExtraClasses);
  const processedImageClasses = processArbitraryClasses(imageExtraClasses);

  // Process textExtraClasses
  const { styles: textStyles, remainingClasses: textClasses } = extractArbitraryStyles(textExtraClasses);
  const processedTextClasses = processArbitraryClasses(textExtraClasses);

  // Base layout changes depending on if we have a side image and its position
  const hasBackgroundImage = !!backgroundImage;
  const hasSideImage = !!sideImage;
  const isSideImageLeft = sideImagePosition === 'left';

  return (
    <section
      id={componentId}
      className={`relative overflow-hidden py-20 md:py-24 ${hasBackgroundImage ? '' : bgColorClasses[backgroundColor] || 'bg-white'} ${processedContainerClasses}`}
      style={containerStyles}
    >
      {/* Background image with overlay */}
      {hasBackgroundImage && (
        <>
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div
              ref={parallaxEnabled ? parallaxRef : null}
              className={`w-full h-full ${parallaxEnabled ? 'absolute top-0 left-0' : ''}`}
              style={parallaxEnabled ? {
                height: `calc(100% + ${parseInt(parallaxSpeed) * 100}px)`,
                bottom: 'auto',
                transform: 'translate3d(0, 0, 0)', // Initial transform to avoid jumping
                willChange: 'transform'
              } : {}}
            >
              <img
                src={backgroundImage}
                alt="Background"
                className="w-full h-full object-cover"
                style={{ minHeight: parallaxEnabled ? '120%' : '100%' }}
              />
            </div>
            <div
              className={`absolute inset-0 ${overlayColorClasses[overlayColor] || 'bg-black'} ${overlayOpacityClasses[overlayOpacity] || 'bg-opacity-50'}`}
            ></div>
          </div>
        </>
      )}

      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
        <div className={`flex flex-col ${hasSideImage ? (isSideImageLeft ? 'md:flex-row-reverse' : 'md:flex-row') : ''} gap-8`}>
          {/* Content section */}
          <div className={`${hasSideImage ? 'md:w-6/12 lg:w-7/12' : 'w-full'} flex ${contentAlignmentClasses[alignment] || 'justify-start'}`}>
            <div
              className={`w-full max-w-3xl ${alignmentClasses[alignment] || 'text-left'} ${processedTextClasses}`}
              style={textStyles}
            >
              {title && (
                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${textColorClasses[textColor] || 'text-white'}`}>
                  {title}
                </h1>
              )}

              {subtitle && (
                <h2 className={`text-xl md:text-2xl font-medium mb-6 ${hasBackgroundImage || backgroundColor === 'dark' || backgroundColor.startsWith('gradient') ? 'text-gray-300' : 'text-gray-600'}`}>
                  {subtitle}
                </h2>
              )}

              {content && (
                <div
                  className={`prose max-w-none mb-8 ${hasBackgroundImage || backgroundColor === 'dark' || backgroundColor.startsWith('gradient') ? 'text-gray-300 prose-headings:text-white prose-a:text-blue-300' : 'text-gray-600'}`}
                  dangerouslySetInnerHTML={createMarkup()}
                />
              )}

              {buttonText && buttonLink && (
                <div className="mt-8">
                  <a
                    href={buttonLink}
                    className={`inline-block py-3 px-8 rounded-full font-medium transition duration-300 ${buttonStyleClasses[buttonStyle] || 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {buttonText}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Side image section */}
          {hasSideImage && (
            <div
              className={`md:w-5/12 lg:w-4/12 ${sideImageWidthClasses[sideImageWidth] || 'md:w-4/10'} ${processedImageClasses}`}
              style={imageStyles}
            >
              <div className="rounded-lg overflow-hidden shadow-xl h-full">
                <img
                  src={sideImage}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TailwindImageHeroComponent;
