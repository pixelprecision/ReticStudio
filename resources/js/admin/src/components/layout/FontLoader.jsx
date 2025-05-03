// resources/js/admin/src/components/layout/FontLoader.jsx
import React, { useEffect, useState } from 'react';

/**
 * FontLoader component that loads the selected Google Font
 * and applies it to the entire application
 */
const FontLoader = () => {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Function to fetch application settings
    const fetchSettings = async () => {
      try {
        // In a real application, this would be an API call
        // For now we'll use a mock implementation
        
        // Mock settings - in a real app this would come from an API
        const mockSettings = {
          google_font: 'Nunito'
        };
        
        loadFont(mockSettings.google_font);
      } catch (error) {
        console.error('Error loading font settings:', error);
        // Load a default font as fallback
        loadFont('Nunito');
      }
    };
    
    // Function to load the Google Font
    const loadFont = (fontName) => {
      if (!fontName) {
        fontName = 'Nunito'; // Default font
      }
      
      const link = document.createElement('link');
      const formattedFontName = fontName.replace(/ /g, '+');
      
      link.href = `https://fonts.googleapis.com/css?family=${formattedFontName}:400,700&display=swap`;
      link.rel = 'stylesheet';
      link.id = 'google-font';
      
      // Remove any existing font link
      const existingLink = document.getElementById('google-font');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
      
      document.head.appendChild(link);
      
      // Apply the font to the root element
      document.documentElement.style.setProperty('--primary-font', `"${fontName}", sans-serif`);
      
      setFontLoaded(true);
    };
    
    fetchSettings();
    
    // Clean up function
    return () => {
      const link = document.getElementById('google-font');
      if (link) {
        document.head.removeChild(link);
      }
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
};

export default FontLoader;