// src/pages/settings/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { FiSave } from 'react-icons/fi';
import { getSettings, updateBatchSettings } from '../../api/settingsApi';
import { showToast } from '../../api/apiClient';

// List of popular Google Fonts
const GOOGLE_FONTS = [
  { name: 'Roboto', category: 'sans-serif' },
  { name: 'Open Sans', category: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif' },
  { name: 'Montserrat', category: 'sans-serif' },
  { name: 'Roboto Condensed', category: 'sans-serif' },
  { name: 'Source Sans Pro', category: 'sans-serif' },
  { name: 'Oswald', category: 'sans-serif' },
  { name: 'Raleway', category: 'sans-serif' },
  { name: 'Nunito', category: 'sans-serif' },
  { name: 'Nunito Sans', category: 'sans-serif' },
  { name: 'Ubuntu', category: 'sans-serif' },
  { name: 'Merriweather', category: 'serif' },
  { name: 'PT Serif', category: 'serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Lora', category: 'serif' },
  { name: 'Poppins', category: 'sans-serif' },
  { name: 'Inter', category: 'sans-serif' },
  { name: 'Rubik', category: 'sans-serif' },
  { name: 'Work Sans', category: 'sans-serif' },
  { name: 'Quicksand', category: 'sans-serif' },
];

const Settings = () => {
	const { group = 'general' } = useParams();
	const navigate = useNavigate();
	const [settings, setSettings] = useState({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		// Fetch settings from the API using the settingsApi method
		const fetchSettings = async () => {
			setLoading(true);
			try {
				const response = await getSettings(group);
				const data = response.data;
				
				// If we get no settings (especially for footer), use defaults
				if (!data[group] || Object.keys(data[group]).length === 0) {
					// Set default values based on group
					if (group === 'footer') {
						data.footer = {
							show_footer: true,
							show_footer_bar: true,
							footer_style: 'standard',
							footer_background_color: '#1f2937',
							footer_text_color: '#ffffff',
							copyright_text: `© ${new Date().getFullYear()} Your Site. All rights reserved.`,
							footer_columns: 3,
							custom_footer_classes: '',
							custom_footer_bar_classes: ''
						};
					}
				}
				
				setSettings(data);
			} catch (error) {
				console.error('Error fetching settings:', error);
				// Fall back to mock data
				const mockSettings = {
			general: {
				site_name: 'Retic Laravel Studio',
				site_description: 'A powerful CMS built with Laravel',
				contact_email: 'admin@example.com',
				site_logo: '',
				site_favicon: '',
			},
			seo: {
				meta_title_template: '{title} | {site_name}',
				meta_description: 'Retic Laravel Studio - A powerful CMS built with Laravel',
				meta_keywords: 'laravel, cms, builder',
				google_analytics_id: '',
			},
			social: {
				facebook_url: '',
				twitter_url: '',
				instagram_url: '',
				linkedin_url: '',
			},
			email: {
				from_name: 'Retic Laravel Studio',
				from_email: 'noreply@example.com',
				smtp_host: 'smtp.mailtrap.io',
				smtp_port: '2525',
				smtp_username: '',
				smtp_password: '',
				smtp_encryption: 'tls',
			},
			appearance: {
				primary_color: '#3490dc',
				secondary_color: '#6c757d',
				font_family: 'Nunito, sans-serif',
				google_font: 'Nunito',
				enable_dark_mode: false,
			},
			footer: {
				show_footer: true,
				show_footer_bar: true,
				footer_style: 'standard',
				footer_background_color: '#1f2937',
				footer_text_color: '#ffffff',
				copyright_text: '© {year} Your Site. All rights reserved.',
				footer_columns: 3,
				custom_footer_classes: '',
				custom_footer_bar_classes: ''
			}
		};

					setSettings(mockSettings);
				} finally {
					setLoading(false);
				}
			};
			
			fetchSettings();
	}, [group]);

	const handleChange = (key, value) => {
		setSettings({
			...settings,
			[group]: {
				...settings[group],
				[key]: value
			}
		});
		
		// If changing google_font, also update font_family for backward compatibility
		if (key === 'google_font') {
			const font = GOOGLE_FONTS.find(f => f.name === value) || GOOGLE_FONTS[0];
			const fontFamily = `${value}, ${font.category}`;
			
			setSettings(prevSettings => ({
				...prevSettings,
				[group]: {
					...prevSettings[group],
					google_font: value,
					font_family: fontFamily
				}
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);

		// Save settings to the API using the settingsApi method
		try {
			// For footer settings, ensure boolean values are properly formatted
			if (group === 'footer') {
				const footerSettings = {...settings[group]};
				if ('show_footer' in footerSettings) {
					footerSettings.show_footer = Boolean(footerSettings.show_footer);
				}
				if ('show_footer_bar' in footerSettings) {
					footerSettings.show_footer_bar = Boolean(footerSettings.show_footer_bar);
				}
				if ('show_social_icons' in footerSettings) {
					footerSettings.show_social_icons = Boolean(footerSettings.show_social_icons);
				}
				
				await updateBatchSettings(footerSettings);
			} else {
				// For other settings
				await updateBatchSettings(settings[group]);
			}
			
			// Success notification
			showToast('Success', 'Settings saved successfully', 'success');
		} catch (error) {
			console.error('Error saving settings:', error);
			// Error notification
			showToast('Error', 'Error saving settings. Please try again.', 'error');
		} finally {
			setSaving(false);
		}
	};

	// Load the selected Google Font
	useEffect(() => {
		// Only run this when settings are loaded and we're on the appearance tab
		if (settings.appearance && group === 'appearance' && settings.appearance.google_font) {
			const fontName = settings.appearance.google_font;
			const fontLink = document.createElement('link');
			
			// Format font name for URL (replace spaces with +)
			const formattedFontName = fontName.replace(/ /g, '+');
			
			fontLink.href = `https://fonts.googleapis.com/css?family=${formattedFontName}:400,700&display=swap`;
			fontLink.rel = 'stylesheet';
			document.head.appendChild(fontLink);
			
			// Clean up when component unmounts or font changes
			return () => {
				try {
					document.head.removeChild(fontLink);
				} catch (error) {
					console.warn('Font link already removed');
				}
			};
		}
	}, [settings.appearance?.google_font, group]);

	// Create input field based on setting type
	const renderField = (key, value) => {
		// Determine input type based on key and value
		let type = 'text';
		if (key.includes('password')) type = 'password';
		if (key.includes('email')) type = 'email';
		if (key.includes('url')) type = 'url';
		if (key.includes('color')) type = 'color';
		if (key === 'google_font') type = 'font';
		if (typeof value === 'boolean') type = 'checkbox';

		switch (type) {
			case 'checkbox':
				return (
					<div className="relative flex items-start">
						<div className="flex items-center h-5">
							<input
								id={key}
								name={key}
								type="checkbox"
								checked={value}
								onChange={(e) => handleChange(key, e.target.checked)}
								className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
							/>
						</div>
						<div className="ml-3 text-sm">
							<label htmlFor={key} className="font-medium text-gray-700">
								{formatLabel(key)}
							</label>
						</div>
					</div>
				);
			case 'color':
				return (
					<div>
						<label htmlFor={key} className="block text-sm font-medium text-gray-700">
							{formatLabel(key)}
						</label>
						<div className="mt-1 flex items-center">
							<input
								type="color"
								id={key}
								name={key}
								value={value}
								onChange={(e) => handleChange(key, e.target.value)}
								className="h-8 w-8 border border-gray-300 rounded-md cursor-pointer"
							/>
							<input
								type="text"
								value={value}
								onChange={(e) => handleChange(key, e.target.value)}
								className="ml-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
							/>
						</div>
					</div>
				);
			case 'font':
				return (
					<div>
						<label htmlFor={key} className="block text-sm font-medium text-gray-700">
							{formatLabel(key)}
						</label>
						<div className="mt-1">
							<select
								id={key}
								name={key}
								value={value}
								onChange={(e) => handleChange(key, e.target.value)}
								className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
							>
								{GOOGLE_FONTS.map((font) => (
									<option 
										key={font.name} 
										value={font.name}
										style={{ fontFamily: `${font.name}, ${font.category}` }}
									>
										{font.name}
									</option>
								))}
							</select>
							<p className="mt-2 text-sm text-gray-500">
								Preview: <span style={{ fontFamily: `${value}, sans-serif` }}>
									The quick brown fox jumps over the lazy dog.
								</span>
							</p>
						</div>
					</div>
				);
			default:
				return (
					<div>
						<label htmlFor={key} className="block text-sm font-medium text-gray-700">
							{formatLabel(key)}
						</label>
						<div className="mt-1">
							<input
								type={type}
								id={key}
								name={key}
								value={value || ''}
								onChange={(e) => handleChange(key, e.target.value)}
								className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
							/>
						</div>
					</div>
				);
		}
	};

	// Format setting key to a human-readable label
	const formatLabel = (key) => {
		return key
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	// Group settings into tabs
	const settingGroups = [
		{ id: 'general', name: 'General' },
		{ id: 'seo', name: 'SEO' },
		{ id: 'social', name: 'Social Media' },
		{ id: 'email', name: 'Email' },
		{ id: 'appearance', name: 'Appearance' },
		{ id: 'footer', name: 'Footer' },
	];

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title="Settings"
				description="Configure your website settings"
			/>

			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex">
						{settingGroups.map((settingGroup) => (
							<button
								key={settingGroup.id}
								onClick={() => navigate(`/admin/settings/${settingGroup.id}`)}
								className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
									group === settingGroup.id
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								{settingGroup.name}
							</button>
						))}
					</nav>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="p-6">
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{settings[group] && Object.entries(settings[group]).map(([key, value]) => (
								<div key={key} className={typeof value === 'boolean' ? 'sm:col-span-2' : ''}>
									{renderField(key, value)}
								</div>
							))}
						</div>
					</div>

					<div className="px-6 py-4 bg-gray-50 text-right">
						<button
							type="submit"
							disabled={saving}
							className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							{saving ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Saving...
								</>
							) : (
								 <>
									 <FiSave className="mr-2 -ml-1 h-5 w-5" />
									 Save Settings
								 </>
							 )}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Settings;