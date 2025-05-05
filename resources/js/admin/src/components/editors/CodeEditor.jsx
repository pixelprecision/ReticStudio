// src/components/editors/CodeEditor.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Simple textarea-based code editor with syntax highlighting mimicking
const SimpleCodeEditor = ({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  readOnly = false,
  theme = 'vs-light'
}) => {
  const [focused, setFocused] = useState(false);
  
  // Get background color based on theme
  const getBgColor = () => {
    return theme === 'vs-dark' ? '#1e1e1e' : '#ffffff';
  };
  
  // Get text color based on theme
  const getTextColor = () => {
    return theme === 'vs-dark' ? '#d4d4d4' : '#000000';
  };
  
  // Handle text change
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  
  return (
    <div className="simple-code-editor" style={{ height, position: 'relative' }}>
      <div 
        className={`editor-container ${focused ? 'focused' : ''}`}
        style={{ 
          height: '100%', 
          border: `1px solid ${focused ? '#0078d4' : '#ccc'}`,
          borderRadius: '3px',
          overflow: 'hidden'
        }}
      >
        <div className="editor-header" style={{ 
          padding: '4px 8px', 
          backgroundColor: theme === 'vs-dark' ? '#333333' : '#f3f3f3',
          color: getTextColor(),
          borderBottom: `1px solid ${theme === 'vs-dark' ? '#555' : '#ddd'}`,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '12px' }}>{language.toUpperCase()}</span>
          {readOnly && <span style={{ fontSize: '12px' }}>Read Only</span>}
        </div>
        
        <textarea
          value={value || ''}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          readOnly={readOnly}
          spellCheck="false"
          style={{
            width: '100%',
            height: 'calc(100% - 28px)',
            padding: '8px',
            resize: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: "'Fira Code', Consolas, 'Courier New', monospace",
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: getBgColor(),
            color: getTextColor(),
            overflow: 'auto'
          }}
        />
      </div>
    </div>
  );
};

SimpleCodeEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  language: PropTypes.string,
  height: PropTypes.string,
  readOnly: PropTypes.bool,
  theme: PropTypes.string
};

export default SimpleCodeEditor;
