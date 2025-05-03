// src/components/theme/LayoutSelector.jsx
import React from 'react';
import { useTheme } from '../../store/ThemeContext';

// Import all available layouts
import DefaultLayout from './layouts/DefaultLayout';
import FullWidthLayout from './layouts/FullWidthLayout';
import SidebarLayout from './layouts/SidebarLayout';
import MinimalLayout from './layouts/MinimalLayout';

// Registry of all available layouts
const LAYOUTS = {
  default: DefaultLayout,
  'full-width': FullWidthLayout,
  sidebar: SidebarLayout,
  minimal: MinimalLayout,
};

/**
 * Layout selector component that chooses the appropriate layout based on theme settings
 * or page-specific layout requirements
 */
const LayoutSelector = ({ layoutName, children, pageTitle, pageDescription, pageProps = {} }) => {
  const { theme } = useTheme();
  
  // Determine which layout to use
  // Priority: 1. Explicit layoutName prop, 2. Theme's default_layout, 3. Fallback to default
  const layoutKey = layoutName || (theme?.default_layout) || 'default';
  
  // Get the layout component from the registry
  const Layout = LAYOUTS[layoutKey] || LAYOUTS.default;
  
  // Render the selected layout
  return (
    <Layout 
      pageTitle={pageTitle} 
      pageDescription={pageDescription}
      {...pageProps}
    >
      {children}
    </Layout>
  );
};

/**
 * Get all available layout options for the theme editor
 */
export const getLayoutOptions = () => {
  return Object.keys(LAYOUTS).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
    value: key
  }));
};

export default LayoutSelector;