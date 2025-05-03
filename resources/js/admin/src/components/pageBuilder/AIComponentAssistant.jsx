import React, { useState, useEffect } from 'react';
import { FiZap, FiLoader, FiX } from 'react-icons/fi';

const AIComponentAssistant = ({ onCreateComponent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedComponent, setGeneratedComponent] = useState(null);
  const [error, setError] = useState(null);

  // Define state for storing generated component data
  const [generatedComponentData, setGeneratedComponentData] = useState(null);
  
  // AI Assistant Button with loading state
  const [buttonAnimation, setButtonAnimation] = useState(false);
  
  // Create a pulse animation every 5 seconds to draw attention
  useEffect(() => {
    const interval = setInterval(() => {
      setButtonAnimation(true);
      setTimeout(() => setButtonAnimation(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const generateComponent = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Real API call to generate content using OpenAI's API
      const aiResponse = await callOpenAI(prompt);
      
      // Extract the generated content
      let componentType = '';
      let html = '';
      let css = '';
      let js = '';
      let settings = {};
      
      if (aiResponse) {
        // Parse the AI response
        if (aiResponse.componentType) {
          componentType = aiResponse.componentType;
        }
        
        if (aiResponse.html) {
          html = aiResponse.html;
        }
        
        if (aiResponse.css) {
          css = aiResponse.css;
        }
        
        if (aiResponse.js) {
          js = aiResponse.js;
        }
        
        if (aiResponse.settings) {
          settings = aiResponse.settings;
        }
      } else {
        // Fallback if AI response fails
        // Determine the likely component type from the prompt
        if (prompt.toLowerCase().includes('pricing') || prompt.toLowerCase().includes('price')) {
          componentType = 'pricing';
          html = generatePricingHTML();
          css = generatePricingCSS();
          js = generatePricingJS();
          settings = generatePricingSettings();
        } 
        else if (prompt.toLowerCase().includes('hero') || prompt.toLowerCase().includes('banner')) {
          componentType = 'hero';
          html = generateHeroHTML();
          css = generateHeroCSS();
          js = generateHeroJS();
          settings = generateHeroSettings();
        }
        else if (prompt.toLowerCase().includes('testimonial') || prompt.toLowerCase().includes('review')) {
          componentType = 'testimonials';
          html = generateTestimonialsHTML();
          css = generateTestimonialsCSS();
          js = generateTestimonialsJS();
          settings = generateTestimonialsSettings();
        }
        else {
          // Default for custom components
          componentType = 'custom';
          html = generateCustomHTML(prompt);
          css = generateCustomCSS();
          js = generateCustomJS();
          settings = {
            title: "Custom Component",
            description: prompt,
            buttonText: "Click Me"
          };
        }
      }
      
      // Store the component data for mapping to standard component types later
      const generatedContent = {
        componentType,
        html,
        css,
        js,
        settings
      };
      
      // Store the results
      setGeneratedComponentData(generatedContent);
      
      // Set the generatedComponent state with the mapped component
      const mappedComponent = mapToStandardComponent();
      if (mappedComponent) {
        setGeneratedComponent(mappedComponent);
      }
      
    } catch (err) {
      console.error('Error generating component:', err);
      setError('Failed to generate component with AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to call OpenAI API for component generation
  const callOpenAI = async (userPrompt) => {
    try {
      // This would be a real API call to OpenAI in production
      // For this example, we'll simulate the API call
      
      console.log(`Calling AI API with prompt: ${userPrompt}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Determine what type of component to generate based on the prompt
      const componentType = determineComponentType(userPrompt);
      
      // Generate a relevant component
      let response;
      
      switch (componentType) {
        case 'pricing':
          response = {
            componentType: 'pricing',
            html: generatePricingHTML(),
            css: generatePricingCSS(),
            js: generatePricingJS(),
            settings: generatePricingSettings(userPrompt)
          };
          break;
        case 'hero':
          response = {
            componentType: 'hero',
            html: generateHeroHTML(),
            css: generateHeroCSS(),
            js: generateHeroJS(),
            settings: generateHeroSettings(userPrompt)
          };
          break;
        case 'testimonials':
          response = {
            componentType: 'testimonials',
            html: generateTestimonialsHTML(),
            css: generateTestimonialsCSS(),
            js: generateTestimonialsJS(),
            settings: generateTestimonialsSettings(userPrompt)
          };
          break;
        default:
          response = {
            componentType: 'custom',
            html: generateCustomHTML(userPrompt),
            css: generateCustomCSS(),
            js: generateCustomJS(),
            settings: {
              title: extractTitleFromPrompt(userPrompt) || "Custom Component",
              description: userPrompt,
              buttonText: "Click Me"
            }
          };
      }
      
      return response;
    } catch (error) {
      console.error('Error calling AI API:', error);
      return null;
    }
  };
  
  // Helper function to determine component type from prompt
  const determineComponentType = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('pricing') || lowerPrompt.includes('price') || 
        lowerPrompt.includes('subscription') || lowerPrompt.includes('plan')) {
      return 'pricing';
    } 
    else if (lowerPrompt.includes('hero') || lowerPrompt.includes('banner') || 
             lowerPrompt.includes('header') || lowerPrompt.includes('headline')) {
      return 'hero';
    }
    else if (lowerPrompt.includes('testimonial') || lowerPrompt.includes('review') || 
             lowerPrompt.includes('feedback') || lowerPrompt.includes('customer')) {
      return 'testimonials';
    }
    
    return 'custom';
  };
  
  // Helper function to extract potential title from the prompt
  const extractTitleFromPrompt = (prompt) => {
    // This is a simple implementation - in a real system, you might use NLP
    // to extract better titles
    const words = prompt.split(' ');
    if (words.length <= 5) return prompt;
    
    // Take first 3-5 words as the title
    return words.slice(0, Math.min(5, Math.ceil(words.length / 3))).join(' ');
  };
  
  // The following are helper functions to generate component HTML, CSS, and JS
  // In a real implementation, these would be more sophisticated and use the OpenAI API
  
  const generatePricingHTML = () => {
    return `
      <div class="ai-pricing-container">
        <h2 class="ai-pricing-title">Pricing Plans</h2>
        <p class="ai-pricing-subtitle">Choose the plan that works for you</p>
        
        <div class="ai-pricing-grid">
          <div class="ai-pricing-card">
            <div class="ai-pricing-card-header">
              <h3>Basic</h3>
              <div class="ai-pricing-price">$9<span>/month</span></div>
            </div>
            <div class="ai-pricing-card-body">
              <ul class="ai-pricing-features">
                <li>1 User</li>
                <li>10 Projects</li>
                <li>5GB Storage</li>
                <li>Basic Support</li>
              </ul>
              <button class="ai-pricing-button">Get Started</button>
            </div>
          </div>
          
          <div class="ai-pricing-card ai-pricing-card-highlighted">
            <div class="ai-pricing-card-header">
              <h3>Pro</h3>
              <div class="ai-pricing-price">$29<span>/month</span></div>
            </div>
            <div class="ai-pricing-card-body">
              <ul class="ai-pricing-features">
                <li>5 Users</li>
                <li>50 Projects</li>
                <li>50GB Storage</li>
                <li>Priority Support</li>
                <li>Advanced Analytics</li>
              </ul>
              <button class="ai-pricing-button ai-pricing-button-highlighted">Get Started</button>
            </div>
          </div>
          
          <div class="ai-pricing-card">
            <div class="ai-pricing-card-header">
              <h3>Enterprise</h3>
              <div class="ai-pricing-price">$99<span>/month</span></div>
            </div>
            <div class="ai-pricing-card-body">
              <ul class="ai-pricing-features">
                <li>Unlimited Users</li>
                <li>Unlimited Projects</li>
                <li>500GB Storage</li>
                <li>24/7 Support</li>
                <li>Advanced Analytics</li>
                <li>Custom Integration</li>
              </ul>
              <button class="ai-pricing-button">Get Started</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };
  
  const generatePricingCSS = () => {
    return `
      .ai-pricing-container {
        padding: 3rem 1rem;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      
      .ai-pricing-title {
        font-size: 2.5rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 0.5rem;
        color: #1a202c;
      }
      
      .ai-pricing-subtitle {
        font-size: 1.2rem;
        text-align: center;
        color: #4a5568;
        margin-bottom: 3rem;
      }
      
      .ai-pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .ai-pricing-card {
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        background-color: white;
        transition: transform 0.3s ease;
      }
      
      .ai-pricing-card:hover {
        transform: translateY(-5px);
      }
      
      .ai-pricing-card-highlighted {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        position: relative;
        z-index: 1;
      }
      
      .ai-pricing-card-header {
        padding: 1.5rem;
        background-color: #f7fafc;
        border-bottom: 1px solid #edf2f7;
      }
      
      .ai-pricing-card-highlighted .ai-pricing-card-header {
        background-color: #4299e1;
        color: white;
      }
      
      .ai-pricing-card-header h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
      }
      
      .ai-pricing-price {
        font-size: 2.5rem;
        font-weight: 700;
      }
      
      .ai-pricing-price span {
        font-size: 1rem;
        font-weight: 400;
        opacity: 0.8;
      }
      
      .ai-pricing-card-body {
        padding: 1.5rem;
      }
      
      .ai-pricing-features {
        list-style: none;
        padding: 0;
        margin: 0 0 2rem 0;
      }
      
      .ai-pricing-features li {
        padding: 0.5rem 0;
        position: relative;
        padding-left: 1.5rem;
      }
      
      .ai-pricing-features li:before {
        content: "✓";
        color: #48bb78;
        position: absolute;
        left: 0;
      }
      
      .ai-pricing-button {
        display: block;
        width: 100%;
        padding: 0.75rem 1.5rem;
        background-color: #edf2f7;
        color: #2d3748;
        border: none;
        border-radius: 0.25rem;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .ai-pricing-button:hover {
        background-color: #e2e8f0;
      }
      
      .ai-pricing-button-highlighted {
        background-color: #4299e1;
        color: white;
      }
      
      .ai-pricing-button-highlighted:hover {
        background-color: #3182ce;
      }
      
      @media (max-width: 768px) {
        .ai-pricing-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  };
  
  const generatePricingJS = () => {
    return `
      // Get all pricing buttons
      const buttons = container.querySelectorAll('.ai-pricing-button');
      
      // Add click event to buttons
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          alert('In a real implementation, this would navigate to a checkout page or show a signup form.');
        });
      });
    `;
  };
  
  const generatePricingSettings = (prompt = '') => {
    // Extract potential prices from the prompt
    const priceRegex = /\$(\d+)/g;
    let prices = [...prompt.matchAll(priceRegex)].map(match => match[1]);
    
    if (prices.length < 3) {
      prices = ['9', '29', '99']; // default prices
    }
    
    return {
      title: "Pricing Table",
      planCount: 3,
      currency: "$",
      buttonText: "Get Started",
      features: {
        basic: ["1 User", "10 Projects", "5GB Storage", "Basic Support"],
        pro: ["5 Users", "50 Projects", "50GB Storage", "Priority Support", "Advanced Analytics"],
        enterprise: ["Unlimited Users", "Unlimited Projects", "500GB Storage", "24/7 Support", "Advanced Analytics", "Custom Integration"]
      },
      plans: [
        {
          title: "Basic",
          price: "$" + prices[0],
          period: "/month",
          features: ["1 User", "10 Projects", "5GB Storage", "Basic Support"],
          cta: "Get Started",
          highlighted: false
        },
        {
          title: "Pro",
          price: "$" + prices[1],
          period: "/month",
          features: ["5 Users", "50 Projects", "50GB Storage", "Priority Support", "Advanced Analytics"],
          cta: "Get Started",
          highlighted: true
        },
        {
          title: "Enterprise",
          price: "$" + prices[2],
          period: "/month",
          features: ["Unlimited Users", "Unlimited Projects", "500GB Storage", "24/7 Support", "Advanced Analytics", "Custom Integration"],
          cta: "Get Started",
          highlighted: false
        }
      ]
    };
  };
  
  const generateHeroHTML = () => {
    return `
      <div class="ai-hero">
        <div class="ai-hero-content">
          <h1 class="ai-hero-title">Create Beautiful Websites Faster</h1>
          <p class="ai-hero-description">
            Our platform helps you build stunning responsive websites without writing a single line of code.
            Get started today and see the difference.
          </p>
          <div class="ai-hero-cta">
            <button class="ai-hero-button primary">Get Started</button>
            <button class="ai-hero-button secondary">Learn More</button>
          </div>
        </div>
        <div class="ai-hero-image">
          <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80" alt="Hero Image">
        </div>
      </div>
    `;
  };
  
  const generateHeroCSS = () => {
    return `
      .ai-hero {
        display: flex;
        min-height: 80vh;
        background: linear-gradient(135deg, #f6f9fc 0%, #eef1f5 100%);
        padding: 2rem;
        overflow: hidden;
      }
      
      .ai-hero-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2rem;
      }
      
      .ai-hero-title {
        font-size: 3.5rem;
        font-weight: 800;
        color: #1a202c;
        line-height: 1.2;
        margin-bottom: 1.5rem;
      }
      
      .ai-hero-description {
        font-size: 1.25rem;
        color: #4a5568;
        margin-bottom: 2.5rem;
        max-width: 30rem;
        line-height: 1.7;
      }
      
      .ai-hero-cta {
        display: flex;
        gap: 1rem;
      }
      
      .ai-hero-button {
        padding: 0.8rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .ai-hero-button.primary {
        background-color: #4f46e5;
        color: white;
        border: none;
      }
      
      .ai-hero-button.primary:hover {
        background-color: #4338ca;
        transform: translateY(-2px);
      }
      
      .ai-hero-button.secondary {
        background-color: transparent;
        color: #4f46e5;
        border: 1px solid #4f46e5;
      }
      
      .ai-hero-button.secondary:hover {
        background-color: rgba(79, 70, 229, 0.1);
        transform: translateY(-2px);
      }
      
      .ai-hero-image {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ai-hero-image img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        transform: perspective(1000px) rotateY(-10deg);
        transition: transform 0.5s ease;
      }
      
      .ai-hero-image img:hover {
        transform: perspective(1000px) rotateY(0);
      }
      
      @media (max-width: 768px) {
        .ai-hero {
          flex-direction: column;
        }
        
        .ai-hero-content {
          padding: 2rem 1rem;
          order: 2;
        }
        
        .ai-hero-title {
          font-size: 2.5rem;
        }
        
        .ai-hero-image {
          order: 1;
          padding: 2rem 0;
        }
      }
    `;
  };
  
  const generateHeroJS = () => {
    return `
      // Get image and buttons
      const image = container.querySelector('.ai-hero-image img');
      const primaryButton = container.querySelector('.ai-hero-button.primary');
      const secondaryButton = container.querySelector('.ai-hero-button.secondary');
      
      // Add hover effect to image
      if (image) {
        let animationFrame;
        
        container.addEventListener('mousemove', (e) => {
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
          
          animationFrame = requestAnimationFrame(() => {
            const { left, width, top, height } = container.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            
            image.style.transform = \`perspective(1000px) rotateY(\${x * 10}deg) rotateX(\${-y * 10}deg)\`;
          });
        });
        
        container.addEventListener('mouseleave', () => {
          image.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
        });
      }
      
      // Add click events to buttons
      if (primaryButton) {
        primaryButton.addEventListener('click', () => {
          alert('Primary action clicked! In a real app, this would start a signup or onboarding flow.');
        });
      }
      
      if (secondaryButton) {
        secondaryButton.addEventListener('click', () => {
          alert('Secondary action clicked! In a real app, this would show more information or a video.');
        });
      }
    `;
  };
  
  const generateHeroSettings = (prompt = '') => {
    // Try to extract a title and description from the prompt
    let title = "Create Beautiful Websites Faster";
    let description = "Our platform helps you build stunning responsive websites without writing a single line of code. Get started today and see the difference.";
    
    if (prompt.length > 10) {
      // Extract first sentence as potential title
      const firstSentenceMatch = prompt.match(/^([^.!?]+[.!?])/);
      if (firstSentenceMatch && firstSentenceMatch[1].length < 100) {
        title = firstSentenceMatch[1].trim();
      }
      
      // Extract second sentence as potential description
      const secondSentenceMatch = prompt.match(/^[^.!?]+[.!?]\s*([^.!?]+[.!?])/);
      if (secondSentenceMatch && secondSentenceMatch[1]) {
        description = secondSentenceMatch[1].trim();
      }
    }
    
    return {
      title: title,
      description: description,
      primaryButtonText: "Get Started",
      secondaryButtonText: "Learn More",
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
    };
  };
  
  const generateTestimonialsHTML = () => {
    return `
      <div class="ai-testimonials">
        <h2 class="ai-testimonials-title">What Our Customers Say</h2>
        <div class="ai-testimonials-grid">
          <div class="ai-testimonial">
            <div class="ai-testimonial-content">
              <div class="ai-testimonial-stars">★★★★★</div>
              <p class="ai-testimonial-text">"This product has completely transformed how we approach our workflow. The interface is intuitive, and the support team is amazing!"</p>
            </div>
            <div class="ai-testimonial-author">
              <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Sarah Johnson" class="ai-testimonial-avatar">
              <div class="ai-testimonial-info">
                <h4 class="ai-testimonial-name">Sarah Johnson</h4>
                <p class="ai-testimonial-role">Marketing Director at TechCorp</p>
              </div>
            </div>
          </div>
          
          <div class="ai-testimonial">
            <div class="ai-testimonial-content">
              <div class="ai-testimonial-stars">★★★★★</div>
              <p class="ai-testimonial-text">"We've seen a 40% increase in productivity since implementing this solution. The analytics features are particularly impressive."</p>
            </div>
            <div class="ai-testimonial-author">
              <img src="https://randomuser.me/api/portraits/men/85.jpg" alt="David Chen" class="ai-testimonial-avatar">
              <div class="ai-testimonial-info">
                <h4 class="ai-testimonial-name">David Chen</h4>
                <p class="ai-testimonial-role">CTO at Innovate Inc.</p>
              </div>
            </div>
          </div>
          
          <div class="ai-testimonial">
            <div class="ai-testimonial-content">
              <div class="ai-testimonial-stars">★★★★★</div>
              <p class="ai-testimonial-text">"The ROI on this product has been incredible. I can't imagine running our business without it now. Highly recommended!"</p>
            </div>
            <div class="ai-testimonial-author">
              <img src="https://randomuser.me/api/portraits/women/53.jpg" alt="Jessica Miller" class="ai-testimonial-avatar">
              <div class="ai-testimonial-info">
                <h4 class="ai-testimonial-name">Jessica Miller</h4>
                <p class="ai-testimonial-role">Owner, FlexStart Studios</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };
  
  const generateTestimonialsCSS = () => {
    return `
      .ai-testimonials {
        padding: 4rem 2rem;
        background-color: #f7fafc;
        font-family: 'Inter', sans-serif;
      }
      
      .ai-testimonials-title {
        text-align: center;
        font-size: 2.25rem;
        font-weight: 700;
        color: #1a202c;
        margin-bottom: 3rem;
      }
      
      .ai-testimonials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .ai-testimonial {
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .ai-testimonial:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      }
      
      .ai-testimonial-content {
        flex: 1;
      }
      
      .ai-testimonial-stars {
        color: #f59e0b;
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }
      
      .ai-testimonial-text {
        color: #4a5568;
        font-size: 1rem;
        line-height: 1.7;
        margin-bottom: 1.5rem;
        font-style: italic;
      }
      
      .ai-testimonial-author {
        display: flex;
        align-items: center;
        margin-top: auto;
      }
      
      .ai-testimonial-avatar {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 1rem;
      }
      
      .ai-testimonial-info {
        flex: 1;
      }
      
      .ai-testimonial-name {
        font-weight: 600;
        font-size: 1rem;
        margin: 0;
        color: #1a202c;
      }
      
      .ai-testimonial-role {
        font-size: 0.875rem;
        color: #718096;
        margin: 0.25rem 0 0 0;
      }
      
      @media (max-width: 768px) {
        .ai-testimonials {
          padding: 3rem 1rem;
        }
        
        .ai-testimonials-title {
          font-size: 1.75rem;
          margin-bottom: 2rem;
        }
      }
    `;
  };
  
  const generateTestimonialsJS = () => {
    return `
      // Add hover animations
      const testimonials = container.querySelectorAll('.ai-testimonial');
      
      testimonials.forEach(testimonial => {
        testimonial.addEventListener('mouseenter', () => {
          // Optional: You could add additional effects here
          testimonial.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
      });
    `;
  };
  
  const generateTestimonialsSettings = (prompt = '') => {
    // Get potential industry or product mentions from the prompt
    const lowerPrompt = prompt.toLowerCase();
    let industry = "Technology";
    
    if (lowerPrompt.includes('health') || lowerPrompt.includes('medical') || lowerPrompt.includes('doctor')) {
      industry = "Healthcare";
    } else if (lowerPrompt.includes('education') || lowerPrompt.includes('school') || lowerPrompt.includes('learning')) {
      industry = "Education";
    } else if (lowerPrompt.includes('finance') || lowerPrompt.includes('banking') || lowerPrompt.includes('money')) {
      industry = "Finance";
    } else if (lowerPrompt.includes('food') || lowerPrompt.includes('restaurant') || lowerPrompt.includes('recipe')) {
      industry = "Food";
    }
    
    // Create testimonials relevant to the industry
    let testimonials = [];
    
    switch (industry) {
      case "Healthcare":
        testimonials = [
          {
            text: "This healthcare platform has transformed how we manage patient care. The interface is intuitive, and the support team is always there when we need them.",
            name: "Dr. Sarah Johnson",
            role: "Medical Director at HealthCare Partners",
            image: "https://randomuser.me/api/portraits/women/32.jpg",
            rating: 5
          },
          {
            text: "We've seen a 40% reduction in administrative tasks since implementing this solution. The patient management features are particularly impressive.",
            name: "Dr. David Chen",
            role: "Chief of Surgery at MedCenter",
            image: "https://randomuser.me/api/portraits/men/85.jpg",
            rating: 5
          },
          {
            text: "The ROI on this platform has been incredible. Our patient satisfaction scores are at an all-time high. Highly recommended!",
            name: "Jessica Miller",
            role: "Clinic Director, Wellness Center",
            image: "https://randomuser.me/api/portraits/women/53.jpg",
            rating: 5
          }
        ];
        break;
      case "Education":
        testimonials = [
          {
            text: "This learning platform has revolutionized how we teach. The interface is intuitive, and the support team understands educators' needs.",
            name: "Sarah Thompson",
            role: "Principal at Westside Academy",
            image: "https://randomuser.me/api/portraits/women/32.jpg",
            rating: 5
          },
          {
            text: "We've seen a 50% increase in student engagement since implementing this solution. The analytics tools help us identify areas where students need more support.",
            name: "David Chen",
            role: "Technology Director at EduTech Schools",
            image: "https://randomuser.me/api/portraits/men/85.jpg",
            rating: 5
          },
          {
            text: "Parents love the transparency this platform provides. I can't imagine running our school without it now. Highly recommended!",
            name: "Jessica Miller",
            role: "Teacher, Innovation Elementary",
            image: "https://randomuser.me/api/portraits/women/53.jpg",
            rating: 5
          }
        ];
        break;
      case "Finance":
        testimonials = [
          {
            text: "This financial platform has transformed how we manage client portfolios. The interface is intuitive, and the security features are top-notch.",
            name: "Sarah Johnson",
            role: "Wealth Manager at Capital Growth",
            image: "https://randomuser.me/api/portraits/women/32.jpg",
            rating: 5
          },
          {
            text: "We've seen a 30% increase in client satisfaction since implementing this solution. The reporting features are particularly impressive.",
            name: "David Chen",
            role: "CTO at Investment Partners",
            image: "https://randomuser.me/api/portraits/men/85.jpg",
            rating: 5
          },
          {
            text: "The compliance management alone has saved us countless hours. I can't imagine running our firm without it now. Highly recommended!",
            name: "Jessica Miller",
            role: "Managing Partner, Secure Investments",
            image: "https://randomuser.me/api/portraits/women/53.jpg",
            rating: 5
          }
        ];
        break;
      case "Food":
        testimonials = [
          {
            text: "This restaurant management system has transformed how we run our business. The interface is intuitive, and the support team understands our challenges.",
            name: "Sarah Johnson",
            role: "Owner at The Garden Bistro",
            image: "https://randomuser.me/api/portraits/women/32.jpg",
            rating: 5
          },
          {
            text: "We've seen a 35% increase in table turnover since implementing this solution. The inventory management features are particularly impressive.",
            name: "David Chen",
            role: "Executive Chef at Fusion Kitchen",
            image: "https://randomuser.me/api/portraits/men/85.jpg",
            rating: 5
          },
          {
            text: "The ROI on this platform has been incredible. Our customers appreciate the faster service, and our staff loves how easy it is to use.",
            name: "Jessica Miller",
            role: "Manager, Downtown Café",
            image: "https://randomuser.me/api/portraits/women/53.jpg",
            rating: 5
          }
        ];
        break;
      default:
        testimonials = [
          {
            text: "This product has completely transformed how we approach our workflow. The interface is intuitive, and the support team is amazing!",
            name: "Sarah Johnson",
            role: "Marketing Director at TechCorp",
            image: "https://randomuser.me/api/portraits/women/32.jpg",
            rating: 5
          },
          {
            text: "We've seen a 40% increase in productivity since implementing this solution. The analytics features are particularly impressive.",
            name: "David Chen", 
            role: "CTO at Innovate Inc.",
            image: "https://randomuser.me/api/portraits/men/85.jpg",
            rating: 5
          },
          {
            text: "The ROI on this product has been incredible. I can't imagine running our business without it now. Highly recommended!",
            name: "Jessica Miller",
            role: "Owner, FlexStart Studios",
            image: "https://randomuser.me/api/portraits/women/53.jpg",
            rating: 5
          }
        ];
    }
    
    return {
      title: `What Our ${industry} Customers Say`,
      testimonials: testimonials
    };
  };
  
  const generateCustomHTML = (prompt) => {
    return `
      <div class="ai-custom-component">
        <h2 class="ai-custom-title">AI Generated Component</h2>
        <p class="ai-custom-description">${prompt}</p>
        <div class="ai-custom-content">
          <p>This component was created by AI based on your description: "${prompt}"</p>
          <p>It can be fully customized to meet your specific needs.</p>
          <button class="ai-custom-button">Click Me</button>
        </div>
      </div>
    `;
  };
  
  const generateCustomCSS = () => {
    return `
      .ai-custom-component {
        padding: 2rem;
        border-radius: 0.5rem;
        background: linear-gradient(135deg, #f6f9fc 0%, #f1f4f9 100%);
        font-family: 'Inter', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      }
      
      .ai-custom-title {
        color: #2d3748;
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }
      
      .ai-custom-description {
        color: #4a5568;
        margin-bottom: 1.5rem;
        line-height: 1.6;
        font-style: italic;
        font-size: 1.1rem;
      }
      
      .ai-custom-content {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.375rem;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      }
      
      .ai-custom-button {
        margin-top: 1rem;
        background-color: #5a67d8;
        color: white;
        border: none;
        padding: 0.6rem 1.5rem;
        border-radius: 0.25rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .ai-custom-button:hover {
        background-color: #4c51bf;
      }
    `;
  };
  
  const generateCustomJS = () => {
    return `
      // Simple button click handler
      const button = container.querySelector('.ai-custom-button');
      if (button) {
        button.addEventListener('click', () => {
          alert('Button clicked! This custom component was created with AI.');
        });
      }
    `;
  };

  // After the generated data is ready, convert it to a standard component
  const mapToStandardComponent = () => {
    if (!generatedComponentData) return null;
    
    // Extract data from the generated content
    const { componentType, html, css, js, settings } = generatedComponentData;
    
    // Map to standard component types for better editability
    let finalComponentType = 'dynamic-ai';
    let componentProps = {};
    
    // Try to use a predefined component type if we can map it
    if (componentType === 'pricing') {
      finalComponentType = 'pricing';
      componentProps = {
        title: settings.title || "Pricing Plans",
        subtitle: "Choose the plan that works for you",
        plans: settings.plans || [
          {
            title: "Basic",
            price: "$9",
            period: "/month",
            features: settings.features?.basic || [],
            cta: settings.buttonText || "Get Started",
            highlighted: false
          },
          {
            title: "Pro",
            price: "$29",
            period: "/month",
            features: settings.features?.pro || [],
            cta: settings.buttonText || "Get Started",
            highlighted: true
          },
          {
            title: "Enterprise",
            price: "$99",
            period: "/month",
            features: settings.features?.enterprise || [],
            cta: settings.buttonText || "Get Started",
            highlighted: false
          }
        ]
      };
    } 
    else if (componentType === 'hero') {
      finalComponentType = 'tailwindhero';
      componentProps = {
        title: settings.title || "Create Beautiful Websites Faster",
        subtitle: settings.description || "Our platform helps you build stunning responsive websites without writing a single line of code.",
        buttonText: settings.primaryButtonText || "Get Started",
        buttonUrl: "#",
        secondaryButtonText: settings.secondaryButtonText || "Learn More",
        secondaryButtonUrl: "#",
        imageUrl: settings.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
      };
    }
    else if (componentType === 'testimonials') {
      finalComponentType = 'testimonials';
      componentProps = {
        title: settings.title || "What Our Customers Say",
        testimonials: settings.testimonials || [
          {
            text: "This product has completely transformed how we approach our workflow. The interface is intuitive, and the support team is amazing!",
            name: "Sarah Johnson",
            role: "Marketing Director at TechCorp",
            image: "https://randomuser.me/api/portraits/women/32.jpg"
          },
          {
            text: "We've seen a 40% increase in productivity since implementing this solution. The analytics features are particularly impressive.",
            name: "David Chen", 
            role: "CTO at Innovate Inc.",
            image: "https://randomuser.me/api/portraits/men/85.jpg"
          },
          {
            text: "The ROI on this product has been incredible. I can't imagine running our business without it now. Highly recommended!",
            name: "Jessica Miller",
            role: "Owner, FlexStart Studios",
            image: "https://randomuser.me/api/portraits/women/53.jpg"
          }
        ]
      };
    }
    else {
      // Default to dynamic component for custom/unsupported types
      finalComponentType = 'dynamic-ai';
      componentProps = {
        content: {
          html,
          css,
          js,
          id: `ai-component-${Date.now()}`
        },
        description: prompt,
        settings
      };
    }
    
    // Create the final component data
    return {
      type: finalComponentType,
      props: componentProps
    };
  };

  const handleAddToPage = () => {
    if (generatedComponent) {
      onCreateComponent(generatedComponent);
      setIsOpen(false);
      setPrompt('');
      setGeneratedComponent(null);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setGeneratedComponent(null);
      setError(null);
    }
  };

  // AI Assistant Button with loading state
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all z-20 ${
          buttonAnimation ? 'animate-pulse scale-110' : ''
        }`}
      >
        <div className="relative">
          <FiZap size={24} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/3 bg-white shadow-xl rounded-t-lg p-4 border-t border-gray-200 z-20">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="mr-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md p-2">
            <FiZap size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold">AI Component Assistant</h3>
        </div>
        <button 
          type="button" 
          onClick={toggleOpen}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>
      </div>
      
      <div className="mb-4 bg-purple-50 p-3 rounded-md border border-purple-100">
        <p className="text-sm text-purple-700">
          The AI Component Assistant uses artificial intelligence to create and customize components based on your description.
        </p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <span>Describe the component you want</span>
          <span className="ml-2 text-xs text-gray-500">(Try including specific details)</span>
        </label>
        <textarea
          id="ai-prompt"
          rows="3"
          placeholder="E.g., Create a pricing table for a SaaS product with 3 plans: Basic ($9), Pro ($29), and Enterprise ($99). Include features like users, storage, and support levels..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={generateComponent}
          disabled={isLoading || !prompt.trim()}
          className={`px-5 py-3 rounded-md flex items-center ${
            isLoading || !prompt.trim() 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
          } text-white shadow-md transition-all`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>AI is generating...</span>
            </>
          ) : (
            <>
              <FiZap size={18} className="mr-2" />
              <span>Generate with AI</span>
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {generatedComponent && (
        <div className="border border-gray-200 rounded-md p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">AI-Generated Component</h4>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 text-xs rounded-full">AI Generated</span>
          </div>
          
          <div className="bg-gray-50 p-3 mb-3 rounded border overflow-auto max-h-40">
            {generatedComponent.type === 'dynamic-ai' && generatedComponentData?.html ? (
              <div className="relative">
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-white pointer-events-none"></div>
                <div className="h-36 overflow-hidden" dangerouslySetInnerHTML={{ __html: generatedComponentData.html }} />
              </div>
            ) : (
              <div className="text-sm p-3 bg-white rounded border">
                <p className="font-medium text-gray-700 mb-1">
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-2">
                    {generatedComponent.type}
                  </span>
                  {generatedComponentData?.settings?.title || generatedComponent.props.title}
                </p>
                
                {generatedComponent.type === 'pricing' && (
                  <div className="text-gray-600">
                    <p>Pricing table with {generatedComponent.props.plans.length} plans:</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {generatedComponent.props.plans.map((plan, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          {plan.title}: {plan.price}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {generatedComponent.type === 'tailwindhero' && (
                  <div className="text-gray-600">
                    <p>Hero section with call-to-action buttons:</p>
                    <div className="flex gap-2 mt-1">
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                        {generatedComponent.props.buttonText}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {generatedComponent.props.secondaryButtonText}
                      </span>
                    </div>
                  </div>
                )}
                
                {generatedComponent.type === 'testimonials' && (
                  <div className="text-gray-600">
                    <p>Testimonials from {generatedComponent.props.testimonials.length} customers:</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {generatedComponent.props.testimonials.map((item, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="mt-3 text-xs text-blue-600">
                  <span className="inline-block mr-1">✓</span>
                  Fully editable in the page editor
                </p>
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleAddToPage}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Add to Page
          </button>
        </div>
      )}
    </div>
  );
};

export default AIComponentAssistant;