// resources/js/admin/src/components/pageRenderer/components/StatsComponent.jsx
import React from 'react';

const StatsComponent = ({
  backgroundColor = 'blue-600',
  textColor = 'white',
  stats = [],
  columns = 4,
  componentId
}) => {
  // Background color classes
  const bgColorClasses = {
    'white': 'bg-white',
    'gray-50': 'bg-gray-50',
    'blue-600': 'bg-blue-600',
    'blue-700': 'bg-blue-700',
    'purple-600': 'bg-purple-600',
    'dark': 'bg-gray-900',
    'gradient-blue': 'bg-gradient-to-r from-blue-600 to-blue-800',
    'gradient-purple': 'bg-gradient-to-r from-purple-600 to-indigo-600',
  };

  // Text color classes
  const textColorClasses = {
    'white': 'text-white',
    'gray-900': 'text-gray-900',
    'blue-600': 'text-blue-600',
  };

  // Column grid classes based on the number of columns
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  return (
    <section
      id={componentId}
      className={`py-16 ${bgColorClasses[backgroundColor] || 'bg-blue-600'}`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className={`grid ${columnClasses[columns] || 'grid-cols-2 md:grid-cols-4'} gap-8 text-center`}>
          {stats.map((stat, index) => (
            <div key={index}>
              <div className={`text-4xl md:text-6xl font-bold mb-2 ${textColorClasses[textColor] || 'text-white'}`}>
                {stat.value}
              </div>
              <p className={`text-lg ${textColor === 'white' ? 'text-gray-200' : 'text-gray-600'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsComponent;
