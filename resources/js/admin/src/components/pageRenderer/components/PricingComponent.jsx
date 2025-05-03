// resources/js/admin/src/components/pageRenderer/components/PricingComponent.jsx
import React from 'react';
import { extractArbitraryStyles, processArbitraryClasses } from '../../../utils/tailwindUtils';

const PricingComponent = ({
  title,
  subtitle,
  backgroundColor = 'white',
  pricingPlans = [],
  componentId,
  extraClasses = ''
}) => {
  // Background color classes
  const bgColorClasses = {
    'white': 'bg-white',
    'light': 'bg-gray-50',
    'dark': 'bg-gray-900',
    'primary': 'bg-blue-600',
  };

  // Function to render features with checkmarks
  const renderFeatures = (features, textColor) => {
    if (!features || !Array.isArray(features)) return null;

    return (
      <ul className="mt-6 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className={`h-5 w-5 ${textColor === 'white' ? 'text-green-400' : 'text-green-500'} mt-1 mr-2`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className={textColor === 'white' ? 'text-gray-300' : 'text-gray-600'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Process extraClasses to handle arbitrary Tailwind classes
  const { styles, remainingClasses } = extractArbitraryStyles(extraClasses);
  const processedExtraClasses = processArbitraryClasses(extraClasses);

  return (
    <section
      id={componentId}
      className={`py-20 ${bgColorClasses[backgroundColor] || 'bg-white'} ${processedExtraClasses}`}
      style={styles}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          {title && (
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${backgroundColor === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h2>
          )}

          {subtitle && (
            <p className={`text-xl max-w-3xl mx-auto ${backgroundColor === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => {
            const isPopular = plan.isPopular || false;
            const textColor = plan.style === 'dark' ? 'white' : 'dark';

            return (
              <div
                key={index}
                className={`rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 ${
                  isPopular ? 'ring-2 ring-blue-500 relative' : ''
                } ${
                  plan.style === 'dark' ? 'bg-gray-900' : 'bg-white'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white py-1 px-4 rounded-bl-lg text-sm font-semibold">
                    POPULAR
                  </div>
                )}

                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-4 ${textColor === 'white' ? 'text-white' : 'text-gray-900'}`}>
                    {plan.title}
                  </h3>

                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${plan.style === 'primary' ? 'text-blue-600' : textColor === 'white' ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-lg ml-2 ${textColor === 'white' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>

                  {plan.description && (
                    <p className={`mb-6 ${textColor === 'white' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                  )}

                  {renderFeatures(plan.features, textColor)}

                  {plan.buttonText && plan.buttonLink && (
                    <div className="mt-8">
                      <a
                        href={plan.buttonLink}
                        className={`block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors duration-300 ${
                          plan.style === 'primary'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : plan.style === 'dark'
                              ? 'bg-white hover:bg-gray-100 text-gray-900'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {plan.buttonText}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingComponent;
