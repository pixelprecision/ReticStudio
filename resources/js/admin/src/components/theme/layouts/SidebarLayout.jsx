// src/components/theme/layouts/SidebarLayout.jsx
import React from 'react';
import { useTheme } from '../../../store/ThemeContext';
import MenuRenderComponent from '../../menu/MenuRenderComponent';
import HeaderComponent from '../../pageRenderer/components/HeaderComponent';
import FooterComponent from '../../pageRenderer/components/FooterComponent';

const SidebarLayout = ({ children, pageTitle, pageDescription, sidebarPosition = 'right' }) => {
  const { theme, menus } = useTheme();
  
  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Theme not loaded
      </div>
    );
  }
  
  // Extract theme settings
  const {
    name: siteName = 'Website',
    description: siteDescription = '',
    settings = {}
  } = theme;
  
  // Use theme sidebar position if not explicitly specified
  if (settings.layout && settings.layout.sidebar) {
    sidebarPosition = settings.layout.sidebar;
  }
  
  const {
    colors = {},
    fonts = {},
    layout = {}
  } = settings;
  
  // Calculate container width
  const containerWidth = layout.container_width || '1200px';
  
  // Apply CSS variables for the theme
  React.useEffect(() => {
    if (colors) {
      document.documentElement.style.setProperty('--color-primary', colors.primary || '#3b82f6');
      document.documentElement.style.setProperty('--color-secondary', colors.secondary || '#10b981');
      document.documentElement.style.setProperty('--color-accent', colors.accent || '#f59e0b');
      document.documentElement.style.setProperty('--color-background', colors.background || '#ffffff');
      document.documentElement.style.setProperty('--color-text', colors.text || '#1f2937');
    }
    
    if (fonts) {
      document.documentElement.style.setProperty('--font-heading', fonts.heading || 'Inter');
      document.documentElement.style.setProperty('--font-body', fonts.body || 'Inter');
    }
  }, [theme]);
  
  // Sidebar classes based on position
  const sidebarClasses = sidebarPosition === 'left'
    ? 'w-full lg:w-1/4 lg:pr-6 order-first'
    : 'w-full lg:w-1/4 lg:pl-6 order-last';
    
  // Prepare header settings
  const headerSettings = {
    site_name: siteName,
    logo_url: theme.logo_url,
    colors: colors,
    container_width: containerWidth
  };
  
  return (
    <div className="theme-layout min-h-screen flex flex-col">
      {/* Dynamic Header */}
      <HeaderComponent settings={headerSettings} />
      
      {/* Main Content with Sidebar */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: containerWidth }}>
          {/* Title area */}
          {(pageTitle || pageDescription) && (
            <div className="mb-8">
              {pageTitle && <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>}
              {pageDescription && <div className="text-lg text-gray-600">{pageDescription}</div>}
            </div>
          )}
          
          {/* Content area with sidebar */}
          <div className="flex flex-wrap lg:flex-nowrap">
            {/* Main content */}
            <div className="w-full lg:w-3/4">
              {children}
            </div>
            
            {/* Sidebar */}
            <div className={sidebarClasses}>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Sidebar</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-sm text-gray-600">{siteDescription}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Navigation</h4>
                    <MenuRenderComponent
                      menu={menus.footer} 
                      horizontal={false}
                      className="space-y-1"
                      itemClassName="text-sm text-gray-600 hover:text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Dynamic Footer */}
      <FooterComponent settings={{
        site_name: siteName,
        site_description: siteDescription,
        container_width: containerWidth
      }} />
    </div>
  );
};

export default SidebarLayout;