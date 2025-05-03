// resources/js/admin/src/components/pageRenderer/components/HeaderComponent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopBarComponent from './TopBarComponent';
import SearchComponent from './SearchComponent';
import AuthButtonsComponent from './AuthButtonsComponent';
import CartButtonComponent from './CartButtonComponent';
import MenuRenderComponent from '../../menu/MenuRenderComponent';
import { getHeaderData } from '../../../api/headerApi';

const HeaderComponent = ({ settings = {} }) => {
  const [headerData, setHeaderData] = useState({
    settings: settings,
    components: [],
    menus: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHeaderData();
        console.log('HEADER COMPONENT DATA', data);
        setHeaderData({
          settings: data.settings || settings,
          components: data.components || [],
          menus: data.menus || []
        });
      } catch (error) {
        console.error('Error fetching header data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [settings]);

  if (loading) {
    return <div className="h-16 bg-gray-100 animate-pulse"></div>;
  }

  // Helper function to get components for a specific position
  const getComponentsByPosition = (position) => {
    return headerData.components
      .filter(comp => comp.position === position && comp.is_active)
      .sort((a, b) => a.order - b.order);
  };

  // Helper function to render a component based on its type
  const renderComponent = (component) => {
    // Always parse the settings for every component
    const parsedSettings = parseComponentSettings(component);
    
    switch (component.type) {
      case 'logo':
        return (
          <div key={component.id} className={component.custom_classes || ''}>
            <Link to="/" className="flex items-center">
              {headerData.settings.logo_url && (
                <img
                  src={headerData.settings.logo_url}
                  alt={headerData.settings.site_name || 'Logo'}
                  className={`h-8 w-auto ${parsedSettings?.logo_size === 'small' ? 'h-6' : parsedSettings?.logo_size === 'large' ? 'h-10' : 'h-8'} ${headerData.settings.custom_logo_classes || ''}`}
                />
              )}

              {(!headerData.settings.logo_url || parsedSettings?.show_text) && (
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  {headerData.settings.site_name || 'Site Name'}
                </span>
              )}
            </Link>
          </div>
        );

      case 'menu':
        // Find the menu by ID if available
        const menuId = parsedSettings?.menu_id;
        const menuStyle = parsedSettings?.menu_style || 'horizontal';
        
        // Find the menu object based on string comparison to handle numeric ID vs string ID
        const selectedMenu = menuId 
          ? headerData.menus.find(m => String(m.id) === String(menuId))
          : null;
          
        console.log(`Menu component ${component.id} - Parsed Settings:`, parsedSettings);
        console.log(`Menu component ${component.id} - Menu ID:`, menuId, 'Menu found:', selectedMenu?.name || 'None');
        
        return (
          <div key={component.id} className={component.custom_classes || ''}>
            <MenuRenderComponent
              menuId={menuId}
              menu={selectedMenu} // Pass the full menu object if found
              className="flex space-x-4"
              style={menuStyle}
              horizontal={menuStyle !== 'vertical'}
            />
          </div>
        );

      case 'search':
        return (
          <div key={component.id} className={component.custom_classes || ''}>
            <SearchComponent settings={parsedSettings} />
          </div>
        );

      case 'auth':
        return (
          <div key={component.id} className={component.custom_classes || ''}>
            <AuthButtonsComponent settings={parsedSettings} />
          </div>
        );

      case 'cart':
        return (
          <div key={component.id} className={component.custom_classes || ''}>
            <CartButtonComponent settings={parsedSettings} />
          </div>
        );

      case 'custom':
        return (
          <div
            key={component.id}
            className={component.custom_classes || ''}
            dangerouslySetInnerHTML={{ __html: parsedSettings?.html_content || '' }}
          />
        );

      default:
        return null;
    }
  };

  // Get components for each section
  const topbarComponents = getComponentsByPosition('topbar');
  const headerComponents = getComponentsByPosition('header');
  const subheaderComponents = getComponentsByPosition('subheader');

  // Parse component settings for menu components
  const parseComponentSettings = (component) => {
    if (typeof component.settings === 'string' && component.settings) {
      try {
        return JSON.parse(component.settings);
      } catch (e) {
        console.error(`Error parsing settings for component ${component.id}:`, e);
        return {};
      }
    }
    return component.settings || {};
  };

  // Parse settings for all components
  const topbarComponentsWithParsedSettings = topbarComponents.map(comp => ({
    ...comp,
    parsedSettings: parseComponentSettings(comp)
  }));

  // Find topbar menu component
  const topbarMenuComponent = topbarComponentsWithParsedSettings.find(comp => 
    comp.type === 'menu' && comp.parsedSettings.menu_id
  );

  // Find the menu in the topbar
  const topbarMenu = topbarMenuComponent 
    ? headerData.menus.find(menu => 
        String(menu.id) === String(topbarMenuComponent.parsedSettings.menu_id)
      )
    : null;
    
  console.log('Topbar menu component:', topbarMenuComponent);
  console.log('Topbar menu found:', topbarMenu);

  // Determine header classes based on settings
  const headerClasses = `
    w-full 
    ${headerData.settings.sticky_header ? 'sticky top-0 z-50' : ''}
    ${headerData.settings.transparent_header ? 'bg-transparent' : 'bg-white'}
    shadow-sm
    ${headerData.settings.custom_header_classes || ''}
  `;

  return (
    <header>
      {/* Top Bar */}
      {/* Pass to TopBarComponent which has its own visibility logic */}
      <TopBarComponent
        settings={headerData.settings}
        menu={topbarMenu}
      />

      {/* Main Header */}
      <div className={headerClasses}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {headerComponents
                .filter(comp => ['logo', 'menu'].includes(comp.type))
                .map(renderComponent)}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {headerComponents
                .filter(comp => ['search', 'auth', 'cart', 'custom'].includes(comp.type))
                .map(renderComponent)}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Header */}
      {subheaderComponents.length > 0 && (
        <div className={`w-full bg-gray-50 border-t border-gray-200 ${headerData.settings.custom_subheader_classes || ''}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              {subheaderComponents.map(renderComponent)}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderComponent;
