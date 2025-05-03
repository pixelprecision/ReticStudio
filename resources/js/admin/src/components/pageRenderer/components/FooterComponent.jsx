// resources/js/admin/src/components/pageRenderer/components/FooterComponent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFooterData } from '../../../api/footerApi';
import FooterComponentRenderer from '../../../pages/footer/FooterComponentRenderer';

const FooterComponent = ({ settings = {} }) => {
  const [footerData, setFooterData] = useState({
    settings: settings,
    components: [],
    menus: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFooterData();
        console.log('FOOTER COMPONENT DATA', data);
        setFooterData({
          settings: data.settings || settings,
          components: data.components || [],
          menus: data.menus || []
        });
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [settings]);

  if (loading) {
    return <div className="h-16 bg-gray-800 animate-pulse"></div>;
  }

  // Skip rendering if footer is disabled
  if (!footerData.settings.show_footer) {
    return null;
  }

  // Helper function to get components for a specific position
  const getComponentsByPosition = (position) => {
    return footerData.components
      .filter(comp => comp.position === position && comp.is_active)
      .sort((a, b) => a.order - b.order);
  };

  // Helper function to get components for a specific column
  const getComponentsByColumn = (column) => {
    return footerData.components
      .filter(comp =>
        comp.position.startsWith('column_') &&
        comp.column === column &&
        comp.is_active
      )
      .sort((a, b) => a.order - b.order);
  };

  // Helper function to render a component using FooterComponentRenderer
  const renderComponent = (component) => {
    return (
      <div key={component.id}>
        <FooterComponentRenderer
          component={component}
          settings={footerData.settings}
          menus={footerData.menus}
        />
      </div>
    );
  };

  // Get the footer style
  const footerStyle = footerData.settings.footer_style || 'standard';
  const columns = footerData.settings?.columns || 3;

  // Create array of columns
  const columnArray = [];
  for (let i = 1; i <= columns; i++) {
    columnArray.push(i);
  }

  // Determine if footer bar should be at top or bottom
  const footerBarPosition = footerData.settings.position || 'bottom';

  // Footer Bar component
  const footerBar = footerData.settings.show_footer_bar && (
    <div
      className={`w-full py-4 bg-gray-900 text-gray-400 border-t border-gray-700 ${footerData.settings.custom_footer_bar_classes || ''}`}
    >
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-between items-center w-full">
          {getComponentsByPosition('footer_bar').map(renderComponent)}

          {getComponentsByPosition('footer_bar').length === 0 && (
            <p className="text-gray-400">
              {footerData.settings.copyright_text || `© ${new Date().getFullYear()} ${footerData.settings.site_name || 'Your Site'}. All rights reserved.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Main Footer content
  const mainFooter = (
    <div
      className={`w-full bg-gray-800 text-white py-12 ${footerData.settings.custom_footer_classes || ''}`}
      style={{
        backgroundColor: footerData.settings.footer_background_color || undefined,
        color: footerData.settings.footer_text_color || undefined
      }}
    >
      <div className="container mx-auto px-4">
        {footerStyle === 'standard' && (
          <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
            {columnArray.map(columnIndex => (
              <div key={`column_${columnIndex}`} className="space-y-6">
                {getComponentsByColumn(columnIndex).map(renderComponent)}
              </div>
            ))}
          </div>
        )}

        {footerStyle === 'centered' && (
          <div className="text-center space-y-6">
            {getComponentsByPosition('footer').map(renderComponent)}
          </div>
        )}

        {footerStyle === 'columns' && (
          <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
            {columnArray.map(columnIndex => (
              <div key={`column_${columnIndex}`} className="space-y-6">
                {getComponentsByColumn(columnIndex).map(renderComponent)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render based on footer bar position setting
  return (
    <footer>
      {footerBarPosition === 'top' && footerBar}
      {mainFooter}
      {footerBarPosition === 'bottom' && footerBar}
    </footer>
  );
};

export default FooterComponent;
