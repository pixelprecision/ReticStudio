// resources/js/admin/src/components/pageBuilder/LiveBuilderComponentList.jsx
import React, { useState } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';

const LiveBuilderComponentList = ({ components, onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter components based on search query
  const filteredComponents = components.filter(component => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      component.name.toLowerCase().includes(searchLower) ||
      component.description?.toLowerCase().includes(searchLower) ||
      component.slug.toLowerCase().includes(searchLower)
    );
  });
  
  // Group components by category
  const groupedComponents = filteredComponents.reduce((groups, component) => {
    const category = component.category || 'Basic';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(component);
    return groups;
  }, {});
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-medium">Add Component</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Search components..."
            />
          </div>
        </div>
        
        {/* Component Grid */}
        <div className="overflow-y-auto flex-grow p-4">
          {Object.keys(groupedComponents).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No components found matching your search.
            </div>
          ) : (
            Object.entries(groupedComponents).map(([category, categoryComponents]) => (
              <div key={category} className="mb-8">
                <h4 className="text-lg font-medium mb-3">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryComponents.map(component => (
                    <div
                      key={component.id}
                      className="border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
                      onClick={() => onSelect(component.slug)}
                    >
                      <div className="p-4">
                        <h5 className="font-medium text-gray-900 mb-1">{component.name}</h5>
                        {component.description && (
                          <p className="text-sm text-gray-500">{component.description}</p>
                        )}
                      </div>
                      {/* Component thumbnail or preview */}
                      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                        {component.thumbnail ? (
                          <img 
                            src={component.thumbnail} 
                            alt={component.name} 
                            className="w-full h-24 object-contain"
                          />
                        ) : (
                          <div className="h-24 flex items-center justify-center text-gray-400">
                            {component.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveBuilderComponentList;