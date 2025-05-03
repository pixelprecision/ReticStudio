// resources/js/admin/src/components/pageRenderer/components/TeamComponent.jsx
import React from 'react';
import { extractArbitraryStyles, processArbitraryClasses } from '../../../utils/tailwindUtils';

const TeamComponent = ({
  title,
  subtitle,
  backgroundColor = 'white',
  teamMembers = [],
  columns = 3,
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

  // Column classes based on the number of columns
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
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

        <div className={`grid ${columnClasses[columns] || 'grid-cols-1 md:grid-cols-3'} gap-8`}>
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {member.imageSrc && (
                <img
                  src={member.imageSrc}
                  alt={member.name || `Team Member ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
              )}

              <div className="p-6 text-center">
                {member.name && (
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                )}

                {member.position && (
                  <p className="text-blue-600 mb-3">{member.position}</p>
                )}

                {member.bio && (
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                )}

                {member.socialLinks && member.socialLinks.length > 0 && (
                  <div className="flex justify-center space-x-3">
                    {member.socialLinks.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition"
                        aria-label={link.platform}
                      >
                        <i className={link.icon || `fab fa-${link.platform.toLowerCase()}`}></i>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamComponent;
