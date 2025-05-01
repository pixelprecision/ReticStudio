// resources/js/admin/src/components/pageRenderer/components/PortfolioComponent.jsx
import React from 'react';

const PortfolioComponent = ({
  title,
  subtitle,
  backgroundColor = 'white',
  portfolioItems = [],
  columns = 2,
  componentId
}) => {
  // Background color classes
  const bgColorClasses = {
    'white': 'bg-white',
    'light': 'bg-gray-50',
    'dark': 'bg-gray-900',
    'primary': 'bg-blue-600',
  };

  // Column classes based on the number of columns
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section
      id={componentId}
      className={`py-20 ${bgColorClasses[backgroundColor] || 'bg-white'}`}
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

        <div className={`grid ${columnClasses[columns] || 'grid-cols-1 md:grid-cols-2'} gap-10`}>
          {portfolioItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              {item.imageSrc && (
                <img
                  src={item.imageSrc}
                  alt={item.title || `Project ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
              )}

              <div className="p-6">
                {item.title && (
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                )}

                {item.description && (
                  <p className="text-gray-600 mb-4">{item.description}</p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag, tagIndex) => {
                      const tagColors = {
                        'blue': 'bg-blue-100 text-blue-800',
                        'green': 'bg-green-100 text-green-800',
                        'red': 'bg-red-100 text-red-800',
                        'yellow': 'bg-yellow-100 text-yellow-800',
                        'purple': 'bg-purple-100 text-purple-800',
                        'pink': 'bg-pink-100 text-pink-800',
                        'indigo': 'bg-indigo-100 text-indigo-800',
                      };

                      const colorClass = tagColors[tag.color] || 'bg-gray-100 text-gray-800';

                      return (
                        <span
                          key={tagIndex}
                          className={`${colorClass} text-xs font-medium px-2.5 py-0.5 rounded`}
                        >
                          {tag.text}
                        </span>
                      );
                    })}
                  </div>
                )}

                {item.linkText && item.linkUrl && (
                  <a
                    href={item.linkUrl}
                    className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center"
                  >
                    {item.linkText}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioComponent;
