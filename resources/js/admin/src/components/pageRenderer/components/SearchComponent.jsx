// resources/js/admin/src/components/pageRenderer/components/SearchComponent.jsx
import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchComponent = ({ settings }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Default settings
  const searchStyle = settings?.search_style || 'icon';
  const placeholder = settings?.placeholder || 'Search...';

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchText);
    // Reset after search if using expandable style
    if (searchStyle === 'expandable') {
      setIsExpanded(false);
      setSearchText('');
    }
  };

  // Render different search styles
  if (searchStyle === 'icon') {
    return (
      <button
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={handleSearch}
        aria-label="Search"
      >
        <FiSearch className="w-5 h-5" />
      </button>
    );
  }

  if (searchStyle === 'expandable') {
    return (
      <div className="relative">
        {isExpanded ? (
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              placeholder={placeholder}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
              onBlur={() => {
                if (!searchText) setIsExpanded(false);
              }}
            />
            <button
              type="submit"
              className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
              aria-label="Submit search"
            >
              <FiSearch className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <button
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setIsExpanded(true)}
            aria-label="Open search"
          >
            <FiSearch className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  // Default input style
  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        placeholder={placeholder}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        aria-label="Submit search"
      >
        <FiSearch className="w-5 h-5" />
      </button>
    </form>
  );
};

export default SearchComponent;