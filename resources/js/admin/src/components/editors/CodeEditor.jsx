// src/components/editors/CodeEditor.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Import Monaco Editor components
import Editor from '@monaco-editor/react';

const CodeEditor = ({
	                    value,
	                    onChange,
	                    language = 'javascript',
	                    height = '400px',
	                    readOnly = false,
	                    theme = 'vs-light'
                    }) => {
	const editorRef = useRef(null);

	const handleEditorDidMount = (editor) => {
		editorRef.current = editor;

		// Set initial options
		editor.updateOptions({
			                     readOnly,
			                     minimap: { enabled: true },
			                     scrollBeyondLastLine: false,
			                     automaticLayout: true,
			                     formatOnPaste: true,
			                     formatOnType: true,
			                     fontFamily: "'Fira Code', Consolas, 'Courier New', monospace",
			                     fontLigatures: true
		                     });

		// Focus the editor if not read-only
		if (!readOnly) {
			editor.focus();
		}
	};

	// Handle external value changes
	useEffect(() => {
		if (editorRef.current) {
			const currentValue = editorRef.current.getValue();

			if (value !== currentValue) {
				editorRef.current.setValue(value);
			}
		}
	}, [value]);

	// Custom language mappings for more accurate syntax highlighting
	const getMonacoLanguage = () => {
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

	// Handle manually updating the model value to avoid re-mounts
	const handleEditorChange = (value) => {
		if (onChange) {
			onChange(value);
		}
	};

	return (
		<div className="code-editor-container" style={{ height }}>
			<Editor
				height="100%"
				language={getMonacoLanguage()}
				value={value}
				onChange={handleEditorChange}
				onMount={handleEditorDidMount}
				theme={theme}
				options={{
					readOnly,
					minimap: { enabled: true },
					scrollBeyondLastLine: false,
					automaticLayout: true,
					formatOnPaste: true,
					formatOnType: true,
					fontSize: 14,
					tabSize: 2,
					fontFamily: "'Fira Code', Consolas, 'Courier New', monospace",
					fontLigatures: true
				}}
			/>
		</div>
	);
};

CodeEditor.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
	language: PropTypes.string,
	height: PropTypes.string,
	readOnly: PropTypes.bool,
	theme: PropTypes.string
};

export default CodeEditor;
