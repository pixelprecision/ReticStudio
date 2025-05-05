// resources/js/admin/src/polyfills.js

// Fix for draft-js requiring 'global' to exist
if (typeof window !== 'undefined') {
  // Fix for 'global' not being defined in browser environment
  if (typeof global === 'undefined') {
    window.global = window;
  }
  
  // Fix for 'process' not being defined in browser environment
  if (typeof process === 'undefined') {
    window.process = { env: { NODE_ENV: 'production' } };
  }
  
  // Fix for fbjs requiring 'global.performance'
  if (typeof global.performance === 'undefined' && typeof window.performance !== 'undefined') {
    global.performance = window.performance;
  }
}

// Additional fixes for other libraries that might use Node.js globals
if (typeof module === 'undefined') {
  window.module = { exports: {} };
}

// RequestAnimationFrame polyfill
if (typeof window !== 'undefined') {
  (function() {
    let lastTime = 0;
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || 
                                    window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback) {
        const currTime = new Date().getTime();
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));
        const id = window.setTimeout(() => callback(currTime + timeToCall), timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };

    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
  }());
}

// Monaco Editor polyfills and fixes
if (typeof window !== 'undefined') {
  // Ensure self is defined (used by Monaco)
  if (typeof self === 'undefined') {
    window.self = window;
  }
  
  // Ensure navigator is defined
  if (typeof navigator === 'undefined') {
    window.navigator = {
      userAgent: 'Mozilla/5.0',
      language: 'en-US'
    };
  }
  
  // Ensure XMLHttpRequest is defined
  if (typeof XMLHttpRequest === 'undefined') {
    window.XMLHttpRequest = function() {
      try {
        return new ActiveXObject("Msxml2.XMLHTTP.6.0");
      } catch (e1) {
        try {
          return new ActiveXObject("Msxml2.XMLHTTP.3.0");
        } catch (e2) {
          throw new Error("XMLHttpRequest is not supported");
        }
      }
    };
  }
  
  // Ensure Worker is defined
  if (typeof Worker === 'undefined') {
    window.Worker = class MockWorker {
      constructor(stringUrl) {
        this.url = stringUrl;
        this.onmessage = null;
      }
      
      postMessage(msg) {
        if (this.onmessage) {
          setTimeout(() => {
            this.onmessage({ data: { type: 'mock', message: msg } });
          }, 0);
        }
      }
      
      terminate() {
        // Do nothing
      }
    };
  }
}