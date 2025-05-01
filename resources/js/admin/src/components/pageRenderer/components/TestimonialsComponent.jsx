// resources/js/admin/src/components/pageRenderer/components/TestimonialsComponent.jsx
import React from 'react';

const TestimonialsComponent = ({
  title,
  subtitle,
  backgroundColor = 'gray-50',
  testimonials = [],
  columns = 2,
  style = 'card',
  componentId
}) => {
  // Background color classes
  const bgColorClasses = {
    'white': 'bg-white',
    'gray-50': 'bg-gray-50',
    'gray-100': 'bg-gray-100',
    'blue-50': 'bg-blue-50',
    'dark': 'bg-gray-900',
  };

  // Text color based on background
  const isDark = backgroundColor === 'dark';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-300' : 'text-gray-600';

  // Column grid classes based on the number of columns
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  // Render card style testimonials
  const renderCardTestimonials = () => (
    <div className={`grid ${columnClasses[columns] || 'grid-cols-1 md:grid-cols-2'} gap-8`}>
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="bg-white p-8 rounded-xl shadow-md relative transition-all duration-300 hover:shadow-lg"
        >
          <div className="text-blue-600 text-6xl absolute top-4 left-4 opacity-10">"</div>
          <div className="relative z-10">
            {testimonial.content && (
              <p className="text-gray-600 mb-6 italic">
                "{testimonial.content}"
              </p>
            )}

            <div className="flex items-center">
              {testimonial.avatar && (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name || 'Client'}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
              )}

              <div>
                {testimonial.name && (
                  <h4 className="font-semibold">{testimonial.name}</h4>
                )}

                {testimonial.title && (
                  <p className="text-gray-500 text-sm">{testimonial.title}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render minimal style testimonials
  const renderMinimalTestimonials = () => (
    <div className="space-y-12">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className={`text-center max-w-3xl mx-auto ${index < testimonials.length - 1 ? 'pb-12 border-b border-gray-200' : ''}`}
        >
          {testimonial.avatar && (
            <img
              src={testimonial.avatar}
              alt={testimonial.name || 'Client'}
              className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
            />
          )}

          {testimonial.content && (
            <p className={`text-xl ${textSecondaryColor} mb-6 italic`}>
              "{testimonial.content}"
            </p>
          )}

          {testimonial.name && (
            <h4 className={`font-semibold text-lg ${textColor}`}>{testimonial.name}</h4>
          )}

          {testimonial.title && (
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.title}</p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section
      id={componentId}
      className={`py-20 ${bgColorClasses[backgroundColor] || 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          {title && (
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textColor}`}>
              {title}
            </h2>
          )}

          {subtitle && (
            <p className={`text-xl max-w-3xl mx-auto ${textSecondaryColor}`}>
              {subtitle}
            </p>
          )}
        </div>

        {style === 'minimal' ? renderMinimalTestimonials() : renderCardTestimonials()}
      </div>
    </section>
  );
};

export default TestimonialsComponent;
