// resources/js/admin/src/components/common/PageHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  description, 
  createButtonLabel, 
  createButtonLink,
  extraButtons = [],
  actionButton
}) => {
  // For debugging purposes
  console.log('PageHeader props:', { title, actionButton });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>

        <div className="flex items-center">
          {actionButton && (
            <Link
              to={actionButton.link}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionButton.icon === 'plus' && (
                <svg className="h-5 w-5 mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {actionButton.label}
            </Link>
          )}
          
          {createButtonLabel && createButtonLink && !actionButton && (
            <Link
              to={createButtonLink}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {createButtonLabel}
            </Link>
          )}
          
          {/* Extra Buttons */}
          {extraButtons.map((button, index) => (
            <Link
              key={index}
              to={button.link}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${button.className || ''}`}
            >
              {button.icon}
              {button.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;