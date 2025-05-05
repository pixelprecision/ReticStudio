// monaco-config.js
import { loader } from '@monaco-editor/react';

// There's an issue with Monaco Editor when using the loader.config method.
// Instead, we'll use a more robust approach.

// Preload Monaco editor
export const preloadMonaco = () => {
  return loader.init()
    .then(monaco => {
      // Initialize any Monaco specific settings here
      return monaco;
    })
    .catch(error => {
      console.error('Monaco initialization error:', error);
      throw error;
    });
};

// Helper function to clean up Monaco models
export const cleanupMonacoModels = (monaco) => {
  if (monaco && monaco.editor) {
    try {
      const models = monaco.editor.getModels();
      if (models && models.length) {
        models.forEach(model => {
          try {
            model.dispose();
          } catch (e) {
            console.warn('Error disposing Monaco model:', e);
          }
        });
      }
    } catch (error) {
      console.error('Error cleaning up Monaco models:', error);
    }
  }
};

// Get the correct language mode for Monaco
export const getMonacoLanguage = (language) => {
  if (!language) return 'javascript';

  switch (language.toLowerCase()) {
    case 'php':
      return 'php';
    case 'js':
    case 'javascript':
      return 'javascript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'xml':
      return 'xml';
    case 'json':
      return 'json';
    case 'blade':
      // Monaco doesn't have blade highlighting, so use HTML as fallback
      return 'html';
    case 'markdown':
    case 'md':
      return 'markdown';
    default:
      return language;
  }
};
