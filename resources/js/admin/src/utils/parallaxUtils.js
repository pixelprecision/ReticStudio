/**
 * Utility functions for handling parallax effects in components
 * 
 * Cross-browser compatibility:
 * - Uses pageYOffset (cross-browser) instead of scrollY
 * - Uses getBoundingClientRect() for accurate positioning
 * - Adds will-change for performance optimization
 */

// Polyfill for window.pageYOffset for older browsers
const getScrollPosition = () => {
  return window.pageYOffset || 
         document.documentElement.scrollTop || 
         document.body.scrollTop || 0;
};

/**
 * Initialize parallax effects on a container or the entire document
 * @param {HTMLElement|Document} container - Container to initialize parallax within (defaults to document)
 */
export const initParallaxEffects = (container = document) => {
  // Find all elements with parallax data attribute
  const parallaxElements = container.querySelectorAll('[data-parallax="true"]');
  
  if (!parallaxElements.length) return;
  
  // Set up scroll handler with improved positioning
  const handleScroll = () => {
    const scrollPosition = getScrollPosition();
    const viewportHeight = window.innerHeight;
    
    parallaxElements.forEach(element => {
      // Get element's containing block position
      const parent = element.parentElement;
      const rect = parent.getBoundingClientRect();
      const containerTop = rect.top + scrollPosition;
      const containerHeight = rect.height;
      
      // Only apply parallax when the container is in or near the viewport
      if (scrollPosition < containerTop + containerHeight + viewportHeight && 
          scrollPosition + viewportHeight > containerTop - viewportHeight) {
          
        // Get parallax speed (default to 0.5 if not specified)
        const speed = parseFloat(element.dataset.parallaxSpeed || 0.5);
        
        // Calculate position relative to the element's container
        const relativeScroll = Math.max(0, scrollPosition - containerTop);
        
        // Apply transform - when at the top of element, position is 0
        const yPos = -(relativeScroll * speed);
        
        // Apply transform
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    });
  };
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
  
  // Initial position
  handleScroll();
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

/**
 * Initialize parallax on a specific element
 * @param {HTMLElement} element - The element to apply parallax to
 * @param {number} speed - Parallax speed (default: 0.5)
 */
export const initElementParallax = (element, speed = 0.5) => {
  if (!element) return;
  
  // Set data attributes
  element.setAttribute('data-parallax', 'true');
  element.setAttribute('data-parallax-speed', speed.toString());
  
  // Ensure correct styling
  element.style.willChange = 'transform';
  
  // Set initial position with bounding
  const handleScroll = () => {
    // Get element's parent container position relative to viewport
    const rect = element.parentElement.getBoundingClientRect();
    const scrollPosition = getScrollPosition();
    const containerTop = rect.top + scrollPosition;
    const containerHeight = rect.height;
    
    // Only apply parallax when the container is in or near viewport
    if (scrollPosition < containerTop + containerHeight && 
        scrollPosition + window.innerHeight > containerTop) {
        
      // Calculate relative scroll position (distance from container top)
      // Use Math.max to ensure we don't go negative when element is at top
      const relativeScroll = Math.max(0, scrollPosition - containerTop);
      
      // Apply parallax with constraints to keep content visible
      const yPos = -(relativeScroll * speed);
      
      // Keep the parallax within reasonable bounds to prevent image from disappearing
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    } else if (scrollPosition <= containerTop) {
      // When above the element, ensure image is at its starting position
      element.style.transform = 'translate3d(0, 0, 0)';
    }
  };
  
  // Add event listener
  window.addEventListener('scroll', handleScroll);
  
  // Initial position
  handleScroll();
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

export default { initParallaxEffects, initElementParallax };