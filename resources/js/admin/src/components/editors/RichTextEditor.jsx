// resources/js/admin/src/components/editors/RichTextEditor.jsx
import React, { useState, useEffect } from 'react';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import { useTheme } from '../../store/ThemeContext';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// Custom component to handle fallback in case the editor fails to load
const RichTextEditor = ({ value, onChange, placeholder = 'Enter content here...' }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [initializing, setInitializing] = useState(true);
  const [editorFailed, setEditorFailed] = useState(false);
  const { theme } = useTheme();

  // Process the HTML value to handle any HTML entities
  const processHtmlValue = (htmlValue) => {
    if (!htmlValue) return '';

    // If content has HTML entities that need to be decoded
    if (typeof htmlValue === 'string' && (htmlValue.includes('&lt;') || htmlValue.includes('&gt;'))) {
      try {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = htmlValue;
        return textarea.value; // Returns decoded HTML
      } catch (error) {
        console.error('Error decoding HTML:', error);
        return htmlValue;
      }
    }
    return htmlValue;
  };

  // Initialize editor with HTML content
  useEffect(() => {
    if (initializing) {
      try {
        if (value) {
          const processedValue = processHtmlValue(value);
          const contentBlock = htmlToDraft(processedValue);

          if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const newEditorState = EditorState.createWithContent(contentState);
            setEditorState(newEditorState);
          }
        } else {
          setEditorState(EditorState.createEmpty());
        }
      } catch (error) {
        console.error('Error initializing editor:', error);
        setEditorFailed(true);
      }

      setInitializing(false);
    }
  }, [value, initializing]);

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);

    if (onChange && !initializing) {
      try {
        const contentState = newEditorState.getCurrentContent();
        const rawContentState = convertToRaw(contentState);
        const html = draftToHtml(rawContentState);
        onChange(html);
      } catch (error) {
        console.error('Error converting editor content to HTML:', error);
      }
    }
  };

  // Handle textarea value change (fallback mode)
  const handleTextareaChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Fallback textarea if editor fails to load
  if (editorFailed) {
    return (
      <div className="rich-text-editor-fallback">
        <textarea
          value={processHtmlValue(value) || ''}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <Editor
        editorState={editorState}
        wrapperClassName="editor-wrapper"
        editorClassName="editor-main"
        toolbarClassName="editor-toolbar"
        onEditorStateChange={onEditorStateChange}
        placeholder={placeholder}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'textAlign', 'colorPicker', 'link', 'history'],
          inline: {
            options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
            monospace: { icon: 'code', className: undefined },
          },
          blockType: {
            options: ['Normal', 'H1', 'H2', 'H3', 'Blockquote', 'Code'],
          },
          textAlign: {
            options: ['left', 'center', 'right', 'justify'],
          },
          colorPicker: {
            // Include custom color option (enables color picker)
            colors: [
              // Theme colors at the top (if available)
              ...(theme?.settings?.colors ? [
                theme.settings.colors.primary,
                theme.settings.colors.secondary,
                theme.settings.colors.accent,
                theme.settings.colors.text,
              ] : []),
              // Basic colors
              '#000000', '#FFFFFF', 
              '#e6194b', '#3cb44b', '#ffe119', '#4363d8', 
              '#f58231', '#911eb4', '#46f0f0', '#f032e6', 
              '#bcf60c', '#fabebe', '#008080', '#e6beff'
            ],
            // Enable custom color input
            className: undefined,
            component: undefined,
            popupClassName: undefined,
            custom: true,
          },
        }}
      />
    </div>
  );
};

export default RichTextEditor;
