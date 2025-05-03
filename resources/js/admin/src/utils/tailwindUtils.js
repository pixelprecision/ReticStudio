// resources/js/admin/src/utils/tailwindUtils.js

/**
 * Transforms arbitrary Tailwind classes like p-[12rem] to standard classes like p-12rem
 * This function helps by turning bracket notation into standard notation that Tailwind can process
 * @param {string} classNames - The Tailwind class string to process
 * @returns {string} Processed class string with arbitrary values transformed
 */
export const processArbitraryClasses = (classNames) => {
  if (!classNames) return '';

  // Split the class string into individual classes
  const classes = classNames.split(' ');
  
  // Process each class
  return classes.map(cls => {
    // Check if it's an arbitrary class with brackets
    const match = cls.match(/^([a-z]+-[xy]?)-\[(.*?)\]$/);
    if (match) {
      const [, prefix, value] = match;
      
      // Remove any spaces from the value
      let cleanValue = value.replace(/\s+/g, '');
      
      // Make sure units are properly formatted
      // If the value is a number followed by a unit, ensure there's no space
      cleanValue = cleanValue.replace(/(\d)(rem|px|em|vh|vw|%)/g, '$1$2');
      
      // If there's just a number, check if we should add a unit
      if (/^\d+$/.test(cleanValue)) {
        // For specific spacing-related properties, add px by default
        if (prefix.match(/^(p|m|w|h|gap|space-[xy]|top|right|bottom|left)/)) {
          cleanValue = `${cleanValue}px`;
        }
      }
      
      // Transform to standard class format
      return `${prefix}-${cleanValue}`;
    }
    
    // Return the original class if it's not an arbitrary class
    return cls;
  }).join(' ');
};

/**
 * Helper function to convert Tailwind arbitrary value classes to inline styles
 * This is useful when Tailwind JIT is not capturing dynamic arbitrary values
 * @param {string} className - The Tailwind class string to process
 * @returns {object} CSS styles object and remaining classes
 */
export const extractArbitraryStyles = (className) => {
  if (!className) return { styles: {}, remainingClasses: '' };
  
  const styles = {};
  const classArray = className.split(' ');
  const remainingClasses = [];

  classArray.forEach(cls => {
    // Match arbitrary value classes like p-[12rem]
    const match = cls.match(/^([a-z]+-[xy]?)-\[(.*?)\]$/);
    if (match) {
      const [, property, value] = match;
      
      // Convert Tailwind property to CSS property
      switch (property) {
        case 'p':
          styles.padding = value;
          break;
        case 'pt':
          styles.paddingTop = value;
          break;
        case 'pr':
          styles.paddingRight = value;
          break;
        case 'pb':
          styles.paddingBottom = value;
          break;
        case 'pl':
          styles.paddingLeft = value;
          break;
        case 'px':
          styles.paddingLeft = value;
          styles.paddingRight = value;
          break;
        case 'py':
          styles.paddingTop = value;
          styles.paddingBottom = value;
          break;
        case 'm':
          styles.margin = value;
          break;
        case 'mt':
          styles.marginTop = value;
          break;
        case 'mr':
          styles.marginRight = value;
          break;
        case 'mb':
          styles.marginBottom = value;
          break;
        case 'ml':
          styles.marginLeft = value;
          break;
        case 'mx':
          styles.marginLeft = value;
          styles.marginRight = value;
          break;
        case 'my':
          styles.marginTop = value;
          styles.marginBottom = value;
          break;
        case 'w':
          styles.width = value;
          break;
        case 'h':
          styles.height = value;
          break;
        case 'top':
          styles.top = value;
          break;
        case 'right':
          styles.right = value;
          break;
        case 'bottom':
          styles.bottom = value;
          break;
        case 'left':
          styles.left = value;
          break;
        case 'text':
          if (value.includes('/')) {
            // Handle text color like text-[#000]/50
            const [color, opacity] = value.split('/');
            styles.color = color;
            styles.opacity = Number(opacity) / 100;
          } else if (value.startsWith('#') || value.startsWith('rgb')) {
            // It's a color
            styles.color = value;
          } else {
            // It's probably a size
            styles.fontSize = value;
          }
          break;
        default:
          // If we don't handle this property, keep it as a class
          remainingClasses.push(cls);
      }
    } else {
      // Not an arbitrary value class, keep it
      remainingClasses.push(cls);
    }
  });

  return {
    styles,
    remainingClasses: remainingClasses.join(' ')
  };
};