// resources/js/admin/src/components/pageRenderer/components/TailwindHeroComponent.jsx
import React from 'react';

const TailwindHeroComponent = ({
  title,
  subtitle,
  content,
  buttonText,
  buttonLink,
  buttonStyle = 'primary',
  alignment = 'left',
  backgroundColor = 'white',
  textColor = 'gray-900',
  componentId
}) => {
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

  // Function to create markup for HTML content
  const createMarkup = () => {
    return { __html: content };
  };

  return (
    <section
      id={componentId}
      className={`py-20 ${bgColorClasses[backgroundColor] || 'bg-white'}`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className={`flex ${contentAlignmentClasses[alignment] || 'justify-start'}`}>
          <div className={`w-full max-w-3xl ${alignmentClasses[alignment] || 'text-left'}`}>
            {title && (
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${textColorClasses[textColor] || 'text-gray-900'}`}>
                {title}
              </h1>
            )}

            {subtitle && (
              <h2 className={`text-xl md:text-2xl font-medium mb-6 ${backgroundColor === 'dark' || backgroundColor.startsWith('gradient') ? 'text-gray-300' : 'text-gray-600'}`}>
                {subtitle}
              </h2>
            )}

            {content && (
              <div
                className={`prose max-w-none mb-8 ${backgroundColor === 'dark' || backgroundColor.startsWith('gradient') ? 'text-gray-300' : 'text-gray-600'}`}
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
      </div>
    </section>
  );
};

export default TailwindHeroComponent;
