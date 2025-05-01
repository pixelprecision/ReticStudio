// resources/js/admin/src/components/pageRenderer/components/ProcessStepComponent.jsx
import React from 'react';

const ProcessStepComponent = ({
  title,
  subtitle,
  backgroundColor = 'gray-50',
  steps = [],
  layout = 'grid',
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

  // Render grid layout
  const renderGridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {steps.map((step, index) => (
        <div
          key={index}
          className="bg-white p-8 rounded-xl shadow-md text-center relative hover:shadow-lg transition-shadow duration-300"
        >
          {/* Step Number */}
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
            {index + 1}
          </div>

          {/* Icon */}
          {step.icon && (
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-3">
              <i className={`${step.icon} text-blue-600 text-2xl`}></i>
            </div>
          )}

          {/* Title */}
          {step.title && (
            <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
          )}

          {/* Description */}
          {step.description && (
            <p className="text-gray-600">{step.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  // Render timeline layout
  const renderTimelineLayout = () => (
    <div className="space-y-12">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col md:flex-row gap-8 items-start">
          {/* Step Number and Line */}
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="h-full w-0.5 bg-blue-200 my-2"></div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white p-6 rounded-xl shadow-md w-full hover:shadow-lg transition-shadow duration-300">
            {/* Icon */}
            {step.icon && (
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <i className={`${step.icon} text-blue-600 text-xl`}></i>
              </div>
            )}

            {/* Title */}
            {step.title && (
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
            )}

            {/* Description */}
            {step.description && (
              <p className="text-gray-600">{step.description}</p>
            )}
          </div>
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

        {layout === 'timeline' ? renderTimelineLayout() : renderGridLayout()}
      </div>
    </section>
  );
};

export default ProcessStepComponent;
