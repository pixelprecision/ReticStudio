// src/components/theme/layouts/DefaultLayout.jsx
import React from 'react';
import { useTheme } from '../../../store/ThemeContext';
import MenuRenderComponent from '../../menu/MenuRenderComponent';
import HeaderComponent from '../../pageRenderer/components/HeaderComponent';
import FooterComponent from '../../pageRenderer/components/FooterComponent';

const DefaultLayout = ({ children, pageTitle, pageDescription, layoutName }) => {
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

  // Prepare header settings
  const headerSettings = {
    site_name: siteName,
    logo_url: theme.logo_url,
    colors: colors,
    container_width: containerWidth
  };

  return (
    <div className="theme-layout min-h-screen flex flex-col" data-g={layoutName}>


      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: containerWidth }}>

          {children}
        </div>
      </main>

    </div>
  );
};

export default DefaultLayout;
