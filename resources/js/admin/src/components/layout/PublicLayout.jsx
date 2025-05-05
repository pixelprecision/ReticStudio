// resources/js/admin/src/components/layout/PublicLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../../store/ThemeContext';
import ReactThemeRenderer from "../theme/ReactThemeRenderer";
import HeaderComponent from '../pageRenderer/components/HeaderComponent';
import FooterComponent from '../pageRenderer/components/FooterComponent';
import LoadingScreen from "../theme/LoadingScreen.jsx";

/**
 * PublicLayout - Layout component for all public-facing pages
 * This provides a consistent wrapper with ThemeProvider and ReactThemeRenderer
 * so only the content changes when navigating between public pages
 */
// Inner component that has access to ThemeContext
const PublicLayoutInner = () => {
  const location = useLocation();
  const { theme, loading, error } = useTheme();

  if (loading || !theme) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-700 mb-3">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
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
  useEffect(() => {
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

  // Prepare footer settings
  const footerSettings = {
    site_name: siteName,
    site_description: siteDescription,
    container_width: containerWidth
  };

  return (
    <div className="theme-layout min-h-screen flex flex-col">
      {/* Dynamic Header */}
      <HeaderComponent settings={headerSettings} />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="">
          <Outlet />
        </div>
      </main>

      {/* Dynamic Footer */}
      <FooterComponent settings={footerSettings} />
    </div>
  );
};

// Outer component that provides ThemeContext
const PublicLayout = () => {
  return (
    <ThemeProvider>
      <PublicLayoutInner />
    </ThemeProvider>
  );
};

export default PublicLayout;
