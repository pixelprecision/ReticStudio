// src/components/theme/layouts/MinimalLayout.jsx
import React from 'react';
import { useTheme } from '../../../store/ThemeContext';
import MenuRenderComponent from '../../menu/MenuRenderComponent';
import HeaderComponent from '../../pageRenderer/components/HeaderComponent';
import FooterComponent from '../../pageRenderer/components/FooterComponent';

const MinimalLayout = ({ children, pageTitle, pageDescription }) => {
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
    settings = {}
  } = theme;

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

  // Prepare header settings for minimal style
  const headerSettings = {
    site_name: siteName,
    logo_url: theme.logo_url,
    colors: colors,
    container_width: containerWidth,
    minimal_style: true,
    sticky_header: false,
    show_topbar: false,
    custom_header_classes: 'py-4 border-b border-gray-200 bg-white'
  };

  return (
    <div className="theme-layout minimal-layout min-h-screen flex flex-col" data-g={layoutName}>


      {/* Main Content - Minimal */}
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4" style={{ maxWidth: containerWidth }}>


          {/* Content area - clean and minimal */}
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </div>
      </main>


    </div>
  );
};

export default MinimalLayout;
