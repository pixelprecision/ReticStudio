// resources/js/admin/src/pages/footer/FooterComponentRenderer.jsx
import React from 'react';
import MenuRenderComponent from '../../components/menu/MenuRenderComponent';
import ComponentRenderer from '../../components/pageRenderer/ComponentRenderer';
import DynamicComponent from '../../components/pageRenderer/DynamicComponent';


/**
 * Component that renders footer components, including both standard footer components
 * and LivePageBuilder components
 */
const FooterComponentRenderer = ({ component, settings, menus }) => {
  if (!component || !component.type) {
    return null;
  }

  // Parse component settings safely
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

  // Parse settings
  const parsedSettings = parseComponentSettings(component);
  console.log(parsedSettings);

  // Handle page component
  if (component.type === 'page_component' && component.page_component_id) {
    // Parse page_component_data if it's a string
    let parsedPageComponentData = {};
    if (typeof component.page_component_data === 'string' && component.page_component_data) {
      try {
        parsedPageComponentData = JSON.parse(component.page_component_data);
      } catch (e) {
        console.error(`Error parsing page_component_data for component ${component.id}:`, e);
      }
    } else if (typeof component.page_component_data === 'object') {
      parsedPageComponentData = component.page_component_data;
    }

    console.log('Rendering footer page component with data:', parsedPageComponentData);

    // Get component definition if available
    const componentType = component.component_definition?.slug || component.component_definition?.category || 'unknown';

    // Create a component structure compatible with ComponentRenderer
    const pageComponent = {
      id: component.page_component_id,
      type: componentType,
      props: parsedPageComponentData
    };

    return (
      <div className={component.custom_classes || ''}>
        {parsedSettings.title && (
          <h3 className="font-semibold text-lg mb-3 text-white">{parsedSettings.title}</h3>
        )}
        <ComponentRenderer component={pageComponent} />
      </div>
    );
  }

  // Handle dynamic AI-generated components
  if (component.type === 'dynamic-ai') {
    return (
      <div className={component.custom_classes || ''}>
        {parsedSettings.title && (
          <h3 className="font-semibold text-lg mb-3 text-white">{parsedSettings.title}</h3>
        )}
        <DynamicComponent content={parsedSettings.content} settings={parsedSettings.settings || {}} />
      </div>
    );
  }

  // Handle standard footer components
  switch (component.type) {
    case 'logo':
      return (
        <div className={component.custom_classes || ''}>
          <div className="flex items-center">
            {settings.logo && (
              <img
                src={`${settings.logo}`}
                alt={settings.site_name || 'Logo'}
                className={`h-8 w-auto ${settings.custom_logo_classes || ''}`}
              />
            )}
            {(!settings.logo || settings.site_name) && (
              <span className="ml-2 text-lg font-semibold">
                {settings.site_name || 'Site Name'}
              </span>
            )}
          </div>
        </div>
      );

    case 'menu':
      // Find the menu
      const menuId = parsedSettings.menu_id;
      const menu = menuId
        ? menus.find(m => String(m.id) === String(menuId))
        : null;

      return (
        <div className={component.custom_classes || ''}>
          <h3 className="font-semibold text-lg mb-3">{parsedSettings.title || 'Menu'}</h3>
          {menu ? (
            <MenuRenderComponent
              menu={menu}
              menuId={menu.id}
              horizontal={false}
              menuPosition={"footer"}
              className="flex flex-col space-y-2"
              itemClassName="hover:text-indigo-600"
            />
          ) : (
            <div className="text-gray-400 italic">No menu selected</div>
          )}
        </div>
      );

    case 'text':
      return (
        <div className={component.custom_classes || ''}>
          {parsedSettings.title && (
            <h3 className="font-semibold text-lg mb-3">{parsedSettings.title}</h3>
          )}
          <div className="">
            {parsedSettings.text || 'Text content goes here'}
          </div>
        </div>
      );

    case 'social':
      return (
        <div className={component.custom_classes || ''}>
          {parsedSettings.title && (
            <h3 className="font-semibold text-lg mb-3">{parsedSettings.title}</h3>
          )}
          <div className="flex space-x-4">
            {Array.isArray(parsedSettings.networks) && parsedSettings.networks.map((network, index) => {
              // Map common social networks to specific icons
              const networkNameMap = {
                'facebook': 'facebook-f',
                'twitter': 'twitter',
                'x': 'x-twitter',
                'instagram': 'instagram',
                'linkedin': 'linkedin-in',
                'youtube': 'youtube',
                'pinterest': 'pinterest-p',
                'tiktok': 'tiktok',
                'snapchat': 'snapchat',
                'github': 'github',
                'telegram': 'telegram',
                'whatsapp': 'whatsapp',
                'discord': 'discord',
                'reddit': 'reddit-alien',
                'twitch': 'twitch',
                'vimeo': 'vimeo-v',
                'medium': 'medium',
                'slack': 'slack',
                'dribbble': 'dribbble',
                'behance': 'behance',
                'spotify': 'spotify',
                'apple': 'apple',
                'google': 'google',
                'amazon': 'amazon',
                'mastodon': 'mastodon',
                'threads': 'threads'
              };
              
              // Determine the icon to use with fallback
              const normalizedNetworkName = network.name ? network.name.toLowerCase().trim() : '';
              const iconName = networkNameMap[normalizedNetworkName] || normalizedNetworkName;
              const brandIcon = `fa-brands fa-${iconName}`;
              
              return (
                <a
                  key={index}
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label={`Visit our ${network.name} page`}
                >
                  <i className={`${brandIcon} text-xl`}></i>
                  <span className="sr-only">{network.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      );

    case 'contact':
      return (
        <div className={component.custom_classes || ''}>
          {parsedSettings.title && (
            <h3 className="font-semibold text-lg mb-3">{parsedSettings.title}</h3>
          )}
          <div className="space-y-2">
            {parsedSettings.address && (
              <div className="flex items-start">
                <i className="fa-solid fa-location-dot mt-1 mr-2 w-5 text-center"></i>
                <span>{parsedSettings.address}</span>
              </div>
            )}
            {parsedSettings.phone && (
              <div className="flex items-center">
                <i className="fa-solid fa-phone mr-2 w-5 text-center"></i>
                <span>{parsedSettings.phone}</span>
              </div>
            )}
            {parsedSettings.email && (
              <div className="flex items-center">
                <i className="fa-solid fa-envelope mr-2 w-5 text-center"></i>
                <span>{parsedSettings.email}</span>
              </div>
            )}
          </div>
        </div>
      );

    case 'copyright':
      return (
        <div className={component.custom_classes || ''}>
          <p className="text-gray-500">
            {parsedSettings.text || settings.copyright_text || `© ${new Date().getFullYear()} ${settings.site_name || 'Your Site'}. All rights reserved.`}
          </p>
        </div>
      );

    case 'component':
      // Legacy component type - now handled by page_component type
      const componentId = parsedSettings.component_id;

      if (!componentId) {
        return (
          <div className={component.custom_classes || ''}>
            {parsedSettings.title && (
              <h3 className="font-semibold text-lg mb-3">{parsedSettings.title}</h3>
            )}
            <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
              <div className="text-center text-gray-500">
                <i className="fa-solid fa-puzzle-piece text-lg mb-2"></i>
                <p>No component selected</p>
              </div>
            </div>
          </div>
        );
      }

      // Create a component structure compatible with ComponentRenderer
      const pageComponent = {
        id: componentId,
        type: component.category || 'unknown',
        props: parsedSettings.component_data || {}
      };

      return (
        <div className={component.custom_classes || ''}>
          {parsedSettings.title && (
            <h3 className="font-semibold text-lg mb-3">{parsedSettings.title}</h3>
          )}
          <ComponentRenderer component={pageComponent} />
        </div>
      );

    default:
      return (
        <div className="bg-gray-100 border border-gray-300 p-4 rounded my-4">
          <p className="text-gray-500">Unknown component type: {component.type}</p>
        </div>
      );
  }
};

export default FooterComponentRenderer;
