// resources/js/admin/src/components/common/PageHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  description, 
  createButtonLabel, 
  createButtonLink,
  extraButtons = []
}) => {
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
          {createButtonLabel && createButtonLink && (
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