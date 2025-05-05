// resources/js/admin/src/components/pageRenderer/ComponentRenderer.jsx
import React, { useEffect, useRef } from 'react';
import HeadingComponent from './components/HeadingComponent';
import TextComponent from './components/TextComponent';
import ButtonComponent from './components/ButtonComponent';
import ImageComponent from './components/ImageComponent';
import DividerComponent from './components/DividerComponent';
import TailwindHeroComponent from './components/TailwindHeroComponent';
import TailwindImageHeroComponent from './components/TailwindImageHeroComponent';
import VideoHeroComponent from './components/VideoHeroComponent';
import PricingComponent from './components/PricingComponent';
import TeamComponent from './components/TeamComponent';
import PortfolioComponent from './components/PortfolioComponent';
import ProcessStepComponent from './components/ProcessStepComponent';
import StatsComponent from './components/StatsComponent';
import TestimonialsComponent from './components/TestimonialsComponent';
import DynamicComponent from './DynamicComponent';
import { initParallaxEffects } from '../../utils/parallaxUtils';

// Import store components
import {
  CategoryGridComponent,
  CategoryListComponent,
  CategoryMenuComponent,
  ProductGridComponent,
  ProductListComponent,
  ProductPageComponent
} from './storeComponents';

/**
 * Component that renders different components based on their type
 * Now accepts pageData to pass to child components
 */
const ComponentRenderer = ({ component, pageData }) => {
  const componentRef = useRef(null);
  
  // Initialize parallax effects after component renders
  useEffect(() => {
    if (componentRef.current) {
      // Initialize parallax effects within this component's DOM
      const cleanup = initParallaxEffects(componentRef.current);
      return cleanup;
    }
  }, [component]); // Re-initialize when component changes
  
  if (!component || !component.type) {
    return null;
  }

  // Map of component types to their React components
  const componentMap = {
    heading: HeadingComponent,
    text: TextComponent,
    button: ButtonComponent,
    image: ImageComponent,
    divider: DividerComponent,
    tailwindhero: TailwindHeroComponent,
    tailwindimagehero: TailwindImageHeroComponent,
    videohero: VideoHeroComponent,
    pricing: PricingComponent,
    team: TeamComponent,
    portfolio: PortfolioComponent,
    process: ProcessStepComponent,
    stats: StatsComponent,
    testimonials: TestimonialsComponent,
    // Store components
    'category-grid': CategoryGridComponent,
    'category-list': CategoryListComponent,
    'category-menu': CategoryMenuComponent,
    'product-grid': ProductGridComponent,
    'product-list': ProductListComponent,
    'product-page': ProductPageComponent,
    // Add more component types here as needed
  };

  // Handle dynamic AI-generated components
  if (component.type === 'dynamic-ai') {
    return (
      <DynamicComponent 
        content={component.props.content} 
        settings={component.props.settings || {}} 
        pageData={pageData}
      />
    );
  }

  // Get the component from the map
  const Component = componentMap[component.type];

  // If no matching component is found, render a placeholder
  if (!Component) {
    return (
      <div className="bg-gray-100 border border-gray-300 p-4 rounded my-4">
        <p className="text-gray-500">Unknown component type: {component.type}</p>
      </div>
    );
  }

  // Render the component with its props and pass pageData
  return (
    <div ref={componentRef}>
      <Component {...component.props} componentId={component.id} pageData={pageData} />
    </div>
  );
};

export default ComponentRenderer;
