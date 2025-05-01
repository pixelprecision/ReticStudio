// src/pages/themes/ThemeEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiEye, FiArrowLeft } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import CodeEditor from '../../components/editors/CodeEditor';
import Tabs from '../../components/common/Tabs';
import { getTheme, createTheme, updateTheme } from '../../api/themesApi';

const ThemeEditor = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isNewTheme = id === 'create';

	const [theme, setTheme] = useState({
		                                   id: isNewTheme ? null : parseInt(id),
		                                   name: '',
		                                   slug: '',
		                                   description: '',
		                                   preview_image: 'https://via.placeholder.com/300x200',
		                                   is_active: false,
		                                   is_system: false,
		                                   templates: {
			                                   layout: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>{{ page.title }} - {{ site.name }}</title>\n  <link rel="stylesheet" href="/themes/{{ theme.slug }}/assets/css/style.css">\n  @yield(\'head\')\n</head>\n<body>\n  <header>\n    @include(\'partials.header\')\n  </header>\n  \n  <main>\n    @yield(\'content\')\n  </main>\n  \n  <footer>\n    @include(\'partials.footer\')\n  </footer>\n  \n  <script src="/themes/{{ theme.slug }}/assets/js/main.js"></script>\n  @yield(\'scripts\')\n</body>\n</html>',
			                                   home: '@extends(\'layout\')\n\n@section(\'content\')\n  <div class="container mx-auto px-4 py-8">\n    <h1 class="text-4xl font-bold mb-6">{{ page.title }}</h1>\n    <div class="prose max-w-none">\n      {!! page.content !!}\n    </div>\n  </div>\n@endsection',
			                                   page: '@extends(\'layout\')\n\n@section(\'content\')\n  <div class="container mx-auto px-4 py-8">\n    <h1 class="text-4xl font-bold mb-6">{{ page.title }}</h1>\n    <div class="prose max-w-none">\n      {!! page.content !!}\n    </div>\n  </div>\n@endsection',
			                                   post: '@extends(\'layout\')\n\n@section(\'content\')\n  <div class="container mx-auto px-4 py-8">\n    <article>\n      <header class="mb-6">\n        <h1 class="text-4xl font-bold mb-2">{{ post.title }}</h1>\n        <div class="text-gray-600">\n          <time datetime="{{ post.created_at }}">{{ post.created_at | date(\'F j, Y\') }}</time>\n        </div>\n      </header>\n      \n      <div class="prose max-w-none">\n        {!! post.content !!}\n      </div>\n    </article>\n  </div>\n@endsection',
			                                   header: '<div class="bg-white shadow">\n  <div class="container mx-auto px-4">\n    <div class="flex justify-between items-center py-4">\n      <div>\n        <a href="/" class="text-xl font-bold text-gray-900">{{ site.name }}</a>\n      </div>\n      <nav>\n        <ul class="flex space-x-4">\n          @foreach($menus.main as $item)\n            <li>\n              <a href="{{ $item.url }}" class="text-gray-600 hover:text-gray-900">{{ $item.title }}</a>\n            </li>\n          @endforeach\n        </ul>\n      </nav>\n    </div>\n  </div>\n</div>',
			                                   footer: '<div class="bg-gray-100">\n  <div class="container mx-auto px-4 py-8">\n    <div class="md:flex md:justify-between">\n      <div class="mb-6 md:mb-0">\n        <a href="/" class="text-xl font-bold text-gray-900">{{ site.name }}</a>\n        <p class="mt-2 text-gray-600">{{ site.description }}</p>\n      </div>\n      \n      <div>\n        <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Navigation</h2>\n        <ul class="mt-4 space-y-2">\n          @foreach($menus.footer as $item)\n            <li>\n              <a href="{{ $item.url }}" class="text-base text-gray-600 hover:text-gray-900">{{ $item.title }}</a>\n            </li>\n          @endforeach\n        </ul>\n      </div>\n    </div>\n    \n    <div class="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">\n      <div class="text-base text-gray-600">\n        &copy; {{ "now"|date("Y") }} {{ site.name }}. All rights reserved.\n      </div>\n    </div>\n  </div>\n</div>',
			                                   css: '/* Main Stylesheet */\n\n/* Reset & Base */\n@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");\n\n:root {\n  --color-primary: #3b82f6;\n  --color-primary-dark: #2563eb;\n  --color-secondary: #10b981;\n  --color-secondary-dark: #059669;\n  --color-text: #1f2937;\n  --color-text-light: #6b7280;\n  --color-background: #ffffff;\n  --color-border: #e5e7eb;\n}\n\nbody {\n  font-family: "Inter", sans-serif;\n  color: var(--color-text);\n  line-height: 1.5;\n}\n\n/* Typography */\nh1, h2, h3, h4, h5, h6 {\n  margin-top: 0;\n  font-weight: 700;\n  line-height: 1.2;\n}\n\nh1 { font-size: 2.5rem; }\nh2 { font-size: 2rem; }\nh3 { font-size: 1.75rem; }\nh4 { font-size: 1.5rem; }\nh5 { font-size: 1.25rem; }\nh6 { font-size: 1rem; }\n\na {\n  color: var(--color-primary);\n  text-decoration: none;\n}\n\na:hover {\n  color: var(--color-primary-dark);\n  text-decoration: underline;\n}\n\n/* Utilities */\n.container {\n  width: 100%;\n  max-width: 1200px;\n  margin: 0 auto;\n}\n\n.text-center { text-align: center; }\n.mb-4 { margin-bottom: 1rem; }\n.mt-4 { margin-top: 1rem; }\n.py-8 { padding-top: 2rem; padding-bottom: 2rem; }\n.px-4 { padding-left: 1rem; padding-right: 1rem; }\n\n/* Components */\n.btn {\n  display: inline-block;\n  padding: 0.5rem 1rem;\n  font-weight: 500;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: middle;\n  cursor: pointer;\n  border: 1px solid transparent;\n  border-radius: 0.25rem;\n  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;\n}\n\n.btn-primary {\n  color: #fff;\n  background-color: var(--color-primary);\n  border-color: var(--color-primary);\n}\n\n.btn-primary:hover {\n  color: #fff;\n  background-color: var(--color-primary-dark);\n  border-color: var(--color-primary-dark);\n}\n\n/* Add more styles as needed */\n',
			                                   js: '// Main JavaScript file\n\ndocument.addEventListener("DOMContentLoaded", function() {\n  // Mobile navigation toggle\n  const mobileMenuButton = document.querySelector(".mobile-menu-button");\n  const mobileMenu = document.querySelector(".mobile-menu");\n  \n  if (mobileMenuButton && mobileMenu) {\n    mobileMenuButton.addEventListener("click", function() {\n      mobileMenu.classList.toggle("hidden");\n    });\n  }\n  \n  // Smooth scrolling for anchor links\n  document.querySelectorAll(\'a[href^="#"]\').forEach(anchor => {\n    anchor.addEventListener(\'click\', function (e) {\n      e.preventDefault();\n      \n      const target = document.querySelector(this.getAttribute(\'href\'));\n      if (target) {\n        target.scrollIntoView({\n          behavior: \'smooth\'\n        });\n      }\n    });\n  });\n});\n'
		                                   },
		                                   settings: {
			                                   colors: {
				                                   primary: '#3b82f6',
				                                   secondary: '#10b981',
				                                   accent: '#f59e0b',
				                                   background: '#ffffff',
				                                   text: '#1f2937'
			                                   },
			                                   fonts: {
				                                   heading: 'Inter',
				                                   body: 'Inter'
			                                   },
			                                   layout: {
				                                   container_width: '1200px',
				                                   sidebar: 'right'
			                                   }
		                                   }
	                                   });

	const [loading, setLoading] = useState(!isNewTheme);
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState('templates');
	const [activeTemplate, setActiveTemplate] = useState('layout');
	const [previewUrl, setPreviewUrl] = useState('');

	useEffect(() => {
		if (!isNewTheme) {
			fetchTheme();
		}

		// Set preview URL
		setPreviewUrl(`/preview/theme/${isNewTheme ? 'temp' : id}`);
	}, [id]);

	const fetchTheme = async () => {
		setLoading(true);
		try {
			const response = await getTheme(id);
			setTheme(response.data);
		} catch (error) {
			console.error('Error fetching theme:', error);
			alert('Failed to load theme. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		setTheme(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleTemplateChange = (content) => {
		setTheme(prev => ({
			...prev,
			templates: {
				...prev.templates,
				[activeTemplate]: content
			}
		}));
	};

	const handleSettingsChange = (section, key, value) => {
		setTheme(prev => ({
			...prev,
			settings: {
				...prev.settings,
				[section]: {
					...prev.settings[section],
					[key]: value
				}
			}
		}));
	};

	const handleSave = async () => {
		setSaving(true);

		try {
			let response;

			if (isNewTheme) {
				response = await createTheme(theme);
				navigate(`/admin/themes/${response.data.id}`);
			} else {
				response = await updateTheme(id, theme);
			}

			alert(isNewTheme ? 'Theme created successfully!' : 'Theme updated successfully!');
		} catch (error) {
			console.error('Error saving theme:', error);
			alert('Failed to save theme. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const generateSlug = () => {
		const slug = theme.name
		                  .toLowerCase()
		                  .replace(/\s+/g, '-')
		                  .replace(/[^\w-]+/g, '');

		setTheme(prev => ({
			...prev,
			slug
		}));
	};

	const templateTabs = [
		{ id: 'layout', label: 'Layout' },
		{ id: 'home', label: 'Home' },
		{ id: 'page', label: 'Page' },
		{ id: 'post', label: 'Post' },
		{ id: 'header', label: 'Header' },
		{ id: 'footer', label: 'Footer' },
		{ id: 'css', label: 'CSS' },
		{ id: 'js', label: 'JavaScript' }
	];

	const getLanguage = (templateId) => {
		switch (templateId) {
			case 'css':
				return 'css';
			case 'js':
				return 'javascript';
			default:
				return 'html';
		}
	};

	return (
		<div>
			<PageHeader
				title={isNewTheme ? 'Create Theme' : 'Edit Theme'}
				description={isNewTheme ? 'Create a new website theme' : `Editing: ${theme.name}`}
				backButton={{ label: 'Back to Themes', link: '/admin/themes' }}
			/>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			) : (
				 <>
					 <div className="bg-white shadow rounded-lg mb-6">
						 <div className="p-6">
							 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								 <div>
									 <label className="block text-sm font-medium text-gray-700 mb-1">Theme Name</label>
									 <input
										 type="text"
										 name="name"
										 value={theme.name}
										 onChange={handleChange}
										 onBlur={() => {
											 if (!theme.slug && theme.name) {
												 generateSlug();
											 }
										 }}
										 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										 placeholder="Enter theme name"
									 />
								 </div>

								 <div>
									 <label className="block text-sm font-medium text-gray-700 mb-1">Theme Slug</label>
									 <input
										 type="text"
										 name="slug"
										 value={theme.slug}
										 onChange={handleChange}
										 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										 placeholder="Enter theme slug"
									 />
								 </div>

								 <div className="md:col-span-2">
									 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
									 <textarea
										 name="description"
										 value={theme.description}
										 onChange={handleChange}
										 rows="3"
										 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										 placeholder="Enter theme description"
									 ></textarea>
								 </div>
							 </div>
						 </div>
					 </div>

					 <div className="bg-white shadow rounded-lg overflow-hidden">
						 <Tabs
							 tabs={[
								 { id: 'templates', label: 'Templates' },
								 { id: 'settings', label: 'Settings' },
								 { id: 'assets', label: 'Assets' }
							 ]}
							 activeTab={activeTab}
							 onChange={setActiveTab}
						 />

						 <div className="p-6">
							 {activeTab === 'templates' && (
								 <div>
									 <div className="flex mb-4 overflow-x-auto">
										 {templateTabs.map(tab => (
											 <button
												 key={tab.id}
												 onClick={() => setActiveTemplate(tab.id)}
												 className={`px-4 py-2 mr-2 text-sm font-medium rounded-md ${activeTemplate === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
											 >
												 {tab.label}
											 </button>
										 ))}
									 </div>

									 <div className="border rounded-lg overflow-hidden">
										 <CodeEditor
											 value={theme.templates[activeTemplate]}
											 onChange={handleTemplateChange}
											 language={getLanguage(activeTemplate)}
											 height="500px"
										 />
									 </div>
								 </div>
							 )}

							 {activeTab === 'settings' && (
								 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									 <div>
										 <h3 className="text-lg font-medium text-gray-900 mb-4">Colors</h3>

										 <div className="space-y-4">
											 <div>
												 <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
												 <div className="flex">
													 <input
														 type="color"
														 value={theme.settings.colors.primary}
														 onChange={(e) => handleSettingsChange('colors', 'primary', e.target.value)}
														 className="h-10 w-10 border border-gray-300 rounded-md"
													 />
													 <input
														 type="text"
														 value={theme.settings.colors.primary}
														 onChange={(e) => handleSettingsChange('colors', 'primary', e.target.value)}
														 className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
													 />
												 </div>
											 </div>

											 <div>
												 <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
												 <div className="flex">
													 <input
														 type="color"
														 value={theme.settings.colors.secondary}
														 onChange={(e) => handleSettingsChange('colors', 'secondary', e.target.value)}
														 className="h-10 w-10 border border-gray-300 rounded-md"
													 />
													 <input
														 type="text"
														 value={theme.settings.colors.secondary}
														 onChange={(e) => handleSettingsChange('colors', 'secondary', e.target.value)}
														 className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
													 />
												 </div>
											 </div>

											 <div>
												 <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
												 <div className="flex">
													 <input
														 type="color"
														 value={theme.settings.colors.accent}
														 onChange={(e) => handleSettingsChange('colors', 'accent', e.target.value)}
														 className="h-10 w-10 border border-gray-300 rounded-md"
													 />
													 <input
														 type="text"
														 value={theme.settings.colors.accent}
														 onChange={(e) => handleSettingsChange('colors', 'accent', e.target.value)}
														 className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
													 />
												 </div>
											 </div>

											 <div>
												 <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
												 <div className="flex">
													 <input
														 type="color"
														 value={theme.settings.colors.background}
														 onChange={(e) => handleSettingsChange('colors', 'background', e.target.value)}
														 className="h-10 w-10 border border-gray-300 rounded-md"
													 />
													 <input
														 type="text"
														 value={theme.settings.colors.background}
														 onChange={(e) => handleSettingsChange('colors', 'background', e.target.value)}
														 className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
													 />
												 </div>
											 </div>

											 <div>
												 <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
												 <div className="flex">
													 <input
														 type="color"
														 value={theme.settings.colors.text}
														 onChange={(e) => handleSettingsChange('colors', 'text', e.target.value)}
														 className="h-10 w-10 border border-gray-300 rounded-md"
													 />
													 <input
														 type="text"
														 value={theme.settings.colors.text}
														 onChange={(e) => handleSettingsChange('colors', 'text', e.target.value)}
														 className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
													 />
												 </div>
											 </div>
										 </div>
									 </div>

									 <div>
										 <h3 className="text-lg font-medium text-gray-900 mb-4">Typography & Layout</h3>

										 <div className="space-y-4">
											 <div>
												 <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
												 <select
													 value={theme.settings.fonts.heading}
													 onChange={(e) => handleSettingsChange('fonts', 'heading', e.target.value)}
													 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
												 >
													 <option value="Inter">Inter</option>
													 <option value="Roboto">Roboto</option>
													 <option value="Open Sans">Open Sans</option>
													 <option value="Montserrat">Montserrat</option>
													 <option value="Lato">Lato</option>
												 </select>
											 </div>

											 <div>
												 <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
												 <select
													 value={theme.settings.fonts.body}
													 onChange={(e) => handleSettingsChange('fonts', 'body', e.target.value)}
													 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
												 >
													 <option value="Inter">Inter</option>
													 <option value="Roboto">Roboto</option>
													 <option value="Open Sans">Open Sans</option>
													 <option value="Montserrat">Montserrat</option>
													 <option value="Lato">Lato</option>
												 </select>
											 </div>

											 <div>
												 <label className="block text-sm font-medium text-gray-700 mb-1">Container Width</label>
												 <input
													 type="text"
													 value={theme.settings.layout.container_width}
													 onChange={(e) => handleSettingsChange('layout', 'container_width', e.target.value)}
													 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
												 />
											 </div>

											 <div>
												 <label className="block text-sm font-medium text-gray-700 mb-1">Sidebar Position</label>
												 <select
													 value={theme.settings.layout.sidebar}
													 onChange={(e) => handleSettingsChange('layout', 'sidebar', e.target.value)}
													 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
												 >
													 <option value="left">Left</option>
													 <option value="right">Right</option>
													 <option value="none">No Sidebar</option>
												 </select>
											 </div>
										 </div>
									 </div>
								 </div>
							 )}

							 {activeTab === 'assets' && (
								 <div>
									 <div className="flex justify-between items-center mb-4">
										 <h3 className="text-lg font-medium text-gray-900">Theme Assets</h3>
										 <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
											 Upload Asset
										 </button>
									 </div>

									 <div className="border rounded-lg overflow-hidden">
										 <div className="px-4 py-5 bg-gray-50 border-b border-gray-200 sm:px-6">
											 <h3 className="text-lg leading-6 font-medium text-gray-900">No assets uploaded yet</h3>
											 <p className="mt-1 text-sm text-gray-500">
												 Upload images, fonts, and other assets for your theme.
											 </p>
										 </div>
									 </div>
								 </div>
							 )}
						 </div>

						 <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
							 <button
								 onClick={() => navigate('/admin/themes')}
								 className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
							 >
								 Cancel
							 </button>

							 <div className="flex space-x-2">
								 <a
									 href={previewUrl}
									 target="_blank"
									 rel="noopener noreferrer"
									 className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
								 >
									 <FiEye className="mr-2" />
									 Preview
								 </a>

								 <button
									 onClick={handleSave}
									 disabled={saving}
									 className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								 >
									 {saving ? (
										 <>
											 <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-2 border-transparent border-t-white rounded-full"></div>
											 Saving...
										 </>
									 ) : (
										  <>
											  <FiSave className="mr-2" />
											  Save Theme
										  </>
									  )}
								 </button>
							 </div>
						 </div>
					 </div>
				 </>
			 )}
		</div>
	);
};

export default ThemeEditor;
