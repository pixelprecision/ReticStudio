// resources/js/admin/src/pages/header/HeaderPreview.jsx
import React from 'react';
import { FiMenu, FiSearch, FiUser, FiShoppingCart, FiBell } from 'react-icons/fi';
import MenuRenderComponent from '../../components/menu/MenuRenderComponent';

// Parse component settings if they are a string
const parseComponentSettings = (settings) => {
  if (typeof settings === 'string' && settings) {
    try {
      return JSON.parse(settings);
    } catch (e) {
      console.error('Error parsing component settings:', e);
      return {};
    }
  }
  return settings || {};
};

// Component renderers for each component type
const ComponentRenderer = ({ component }) => {
  // Parse the settings if they're a string
  const parsedSettings = parseComponentSettings(component.settings);
  
  switch (component.type) {
    case 'logo':
      return <LogoComponent settings={parsedSettings} />;
    case 'menu':
      return <MenuComponent settings={parsedSettings} componentId={component.id} />;
    case 'search':
      return <SearchComponent settings={parsedSettings} />;
    case 'auth':
      return <AuthComponent settings={parsedSettings} />;
    case 'cart':
      return <CartComponent settings={parsedSettings} />;
    case 'custom':
      return <CustomComponent settings={parsedSettings} />;
    default:
      return <div>Unknown component type: {component.type}</div>;
  }
};

// Logo component
const LogoComponent = ({ settings }) => {
  return (
    <div className="flex items-center">
      <div className="h-8 w-auto bg-gray-200 rounded flex items-center justify-center px-3">
        <span className="font-bold text-gray-800">LOGO</span>
      </div>
    </div>
  );
};

// Menu component - using context to access menus from all components
const MenuContext = React.createContext([]);

// Menu component
const MenuComponent = ({ settings, componentId }) => {
  // Get menus from context
  const menus = React.useContext(MenuContext);
  
  // Settings are already parsed at the ComponentRenderer level
  const menuId = settings?.menu_id;
  const menuStyle = settings?.menu_style || 'horizontal';
  
  console.log(`Menu Component #${componentId} Settings:`, settings);
  console.log(`Menu #${componentId} ID:`, menuId);
  
  // Find the selected menu from the menus array
  const selectedMenu = menus ? menus.find(menu => String(menu.id) === String(menuId)) : null;
  
  // If no menu_id is found or no matching menu, render a placeholder
  if (!menuId || !selectedMenu) {
    return (
      <nav className="flex space-x-4">
        <a href="#" className="text-gray-800 hover:text-blue-500">Home</a>
        <a href="#" className="text-gray-800 hover:text-blue-500">About</a>
        <a href="#" className="text-gray-800 hover:text-blue-500">Services</a>
        <a href="#" className="text-gray-800 hover:text-blue-500">Blog</a>
      </nav>
    );
  }
  
  // If we found a matching menu, render it
  return (
    <MenuRenderComponent 
      menu={selectedMenu}
      horizontal={menuStyle === 'horizontal'}
      className="text-gray-800"
      itemClassName="hover:text-blue-500"
    />
  );
};

// Search component
const SearchComponent = ({ settings }) => {
  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder="Search..." 
        className="w-full py-1 pl-8 pr-4 text-sm border border-gray-300 rounded-md"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-2">
        <FiSearch className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  );
};

// Auth component
const AuthComponent = ({ settings }) => {
  return (
    <div className="flex items-center space-x-2">
      <button className="text-sm px-2 py-1 rounded hover:bg-gray-100">
        <span className="flex items-center">
          <FiUser className="w-4 h-4 mr-1" />
          Login
        </span>
      </button>
      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
        Register
      </button>
    </div>
  );
};

// Cart component
const CartComponent = ({ settings }) => {
  return (
    <div className="relative">
      <button className="p-1 rounded-full hover:bg-gray-100">
        <FiShoppingCart className="w-5 h-5" />
      </button>
      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
        3
      </span>
    </div>
  );
};

// Custom component
const CustomComponent = ({ settings }) => {
  return (
    <div className="flex items-center space-x-2">
      <button className="p-1 rounded-full hover:bg-gray-100">
        <FiBell className="w-5 h-5" />
      </button>
      <span>Custom</span>
    </div>
  );
};

// Top bar with badge and message
const TopBar = ({ components, message, secondaryMessage, badgeColor }) => {
  return (
    <div className="bg-gray-800 text-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {message && (
            <>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${badgeColor || 'badge-info'}`}>
                {message}
              </span>
              
              {secondaryMessage && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm">{secondaryMessage}</span>
                </>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {components.map((component) => (
            <div key={component.id}>
              <ComponentRenderer component={component} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main header component
const MainHeader = ({ components, style }) => {
  // Group components into left, center, and right based on header style
  let leftComponents = [], centerComponents = [], rightComponents = [];
  
  if (style === 'centered') {
    // For centered, logo goes in the center, menu left, other components right
    components.forEach(component => {
      if (component.type === 'logo') {
        centerComponents.push(component);
      } else if (component.type === 'menu') {
        leftComponents.push(component);
      } else {
        rightComponents.push(component);
      }
    });
  } else if (style === 'split') {
    // For split, logo goes in the center, menu and other components are divided
    const midpoint = Math.floor(components.length / 2);
    components.forEach((component, index) => {
      if (component.type === 'logo') {
        centerComponents.push(component);
      } else if (index < midpoint) {
        leftComponents.push(component);
      } else {
        rightComponents.push(component);
      }
    });
  } else {
    // For standard, just use the order from the database
    components.forEach(component => {
      if (component.settings?.position === 'right') {
        rightComponents.push(component);
      } else if (component.settings?.position === 'center') {
        centerComponents.push(component);
      } else {
        leftComponents.push(component);
      }
    });
  }
  
  return (
    <header className="bg-white py-4 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Left section */}
          <div className="flex items-center space-x-6">
            {leftComponents.map(component => (
              <div key={component.id}>
                <ComponentRenderer component={component} />
              </div>
            ))}
          </div>
          
          {/* Center section - only rendered if there are center components */}
          {centerComponents.length > 0 && (
            <div className="flex items-center space-x-6">
              {centerComponents.map(component => (
                <div key={component.id}>
                  <ComponentRenderer component={component} />
                </div>
              ))}
            </div>
          )}
          
          {/* Right section */}
          <div className="flex items-center space-x-6">
            {rightComponents.map(component => (
              <div key={component.id}>
                <ComponentRenderer component={component} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

// Subheader component
const SubHeader = ({ components }) => {
  return (
    <div className="bg-gray-100 py-2 border-t border-b border-gray-200">
      <div className="container mx-auto px-4 flex items-center justify-center">
        {components.map(component => (
          <div key={component.id} className="mx-3">
            <ComponentRenderer component={component} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Main header preview component
const HeaderPreview = ({ headerData, onClose }) => {
  if (!headerData || !headerData.settings) return null;
  
  // Get components by section
  const topbarComponents = headerData.components.filter(comp => comp.position === 'topbar');
  const headerComponents = headerData.components.filter(comp => comp.position === 'header');
  const subheaderComponents = headerData.components.filter(comp => comp.position === 'subheader');
  
  // Extract settings
  const settings = headerData.settings;
  
  // Extract menus for the MenuContext
  const menus = headerData.menus || [];
  console.log('Available menus:', menus);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-medium">Header Preview</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-4rem)]">
          <div className="border rounded-lg overflow-hidden">
            {/* Preview notice */}
            <div className="bg-blue-50 text-blue-700 text-center py-1 text-sm">
              Preview Mode
            </div>
            
            {/* Provide menus context to all components */}
            <MenuContext.Provider value={menus}>
              {/* Render header sections based on layout settings */}
              <div className="header-preview">
                {settings.show_topbar && (
                  <TopBar
                    components={topbarComponents}
                    message={settings.topbar_message}
                    secondaryMessage={settings.topbar_secondary_message}
                    badgeColor={settings.topbar_badge_color}
                  />
                )}
                
                {settings.show_header !== false && (
                  <MainHeader
                    components={headerComponents}
                    style={settings.header_style || 'standard'}
                  />
                )}
                
                {settings.show_subheader && (
                  <SubHeader components={subheaderComponents} />
                )}
              </div>
            </MenuContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderPreview;