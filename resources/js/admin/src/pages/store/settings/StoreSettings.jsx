import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Tabs from '../../../components/common/Tabs';
import RichTextEditor from '../../../components/editors/RichTextEditor';
import MediaChooser from '../../../components/media/MediaChooser';

const StoreSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState({});
  const [settings, setSettings] = useState({
    store_name: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    store_city: '',
    store_state: '',
    store_postal_code: '',
    store_country: '',
    logo_id: null,
    favicon_id: null,
    currency: 'USD',
    currency_symbol: '$',
    currency_position: 'left',
    thousand_separator: ',',
    decimal_separator: '.',
    decimal_places: 2,
    weight_unit: 'kg',
    dimension_unit: 'cm',
    tax_calculation: 'shipping',
    enable_taxes: false,
    tax_display: 'inclusive',
    default_tax_rate: 0,
    enable_customer_accounts: true,
    enable_guest_checkout: true,
    require_phone: false,
    enable_coupon_codes: true,
    enable_reviews: true,
    approval_required: true,
    shipping_calculator: true,
    flat_rate_shipping: 0,
    free_shipping_threshold: 0,
    terms_and_conditions: '',
    privacy_policy: '',
    return_policy: '',
    shipping_policy: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    google_analytics_id: '',
    facebook_pixel_id: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await storeApi.getStoreSettings();
        setSettings(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching store settings:', err);
        setError('Failed to load store settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) : value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleRichTextChange = (content, field) => {
    setSettings({
      ...settings,
      [field]: content,
    });
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const handleMediaSelect = (mediaItem, field) => {
    setSettings({
      ...settings,
      [field]: mediaItem ? mediaItem.id : null,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!settings.store_name.trim()) {
      newErrors.store_name = 'Store name is required';
    }
    
    if (!settings.store_email.trim()) {
      newErrors.store_email = 'Store email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(settings.store_email)) {
      newErrors.store_email = 'Please enter a valid email address';
    }
    
    if (settings.decimal_places < 0 || settings.decimal_places > 4) {
      newErrors.decimal_places = 'Decimal places must be between 0 and 4';
    }
    
    if (settings.flat_rate_shipping < 0) {
      newErrors.flat_rate_shipping = 'Flat rate shipping cannot be negative';
    }
    
    if (settings.free_shipping_threshold < 0) {
      newErrors.free_shipping_threshold = 'Free shipping threshold cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      await storeApi.updateStoreSettings(settings);
      setErrors({});
      setSaving(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Failed to save settings. Please try again.' });
      }
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'localization', label: 'Localization' },
    { id: 'checkout', label: 'Checkout' },
    { id: 'shipping', label: 'Shipping & Tax' },
    { id: 'policies', label: 'Legal & Policies' },
    { id: 'seo', label: 'SEO & Analytics' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Store Settings" />
      
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'general' && (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="store_name"
                    value={settings.store_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.store_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.store_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.store_name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Email *
                  </label>
                  <input
                    type="email"
                    name="store_email"
                    value={settings.store_email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.store_email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.store_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.store_email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Phone
                  </label>
                  <input
                    type="tel"
                    name="store_phone"
                    value={settings.store_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Logo
                  </label>
                  <MediaChooser
                    selectedMedia={settings.logo_id}
                    onSelect={(media) => handleMediaSelect(media, 'logo_id')}
                    className="w-full"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Favicon
                  </label>
                  <MediaChooser
                    selectedMedia={settings.favicon_id}
                    onSelect={(media) => handleMediaSelect(media, 'favicon_id')}
                    className="w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended size: 32x32 or 16x16 pixels
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Store Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="store_address"
                    value={settings.store_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="store_city"
                    value={settings.store_city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    name="store_state"
                    value={settings.store_state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="store_postal_code"
                    value={settings.store_postal_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="store_country"
                    value={settings.store_country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'localization' && (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="CAD">Canadian Dollar (CAD)</option>
                    <option value="AUD">Australian Dollar (AUD)</option>
                    <option value="JPY">Japanese Yen (JPY)</option>
                    <option value="CNY">Chinese Yuan (CNY)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    name="currency_symbol"
                    value={settings.currency_symbol}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency Position
                  </label>
                  <select
                    name="currency_position"
                    value={settings.currency_position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="left">Left ($99.99)</option>
                    <option value="right">Right (99.99$)</option>
                    <option value="left_space">Left with space ($ 99.99)</option>
                    <option value="right_space">Right with space (99.99 $)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thousand Separator
                  </label>
                  <input
                    type="text"
                    name="thousand_separator"
                    value={settings.thousand_separator}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    maxLength={1}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decimal Separator
                  </label>
                  <input
                    type="text"
                    name="decimal_separator"
                    value={settings.decimal_separator}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    maxLength={1}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decimal Places
                  </label>
                  <input
                    type="number"
                    name="decimal_places"
                    value={settings.decimal_places}
                    onChange={handleInputChange}
                    min={0}
                    max={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.decimal_places ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.decimal_places && (
                    <p className="mt-1 text-sm text-red-600">{errors.decimal_places}</p>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Measurement Units</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight Unit
                  </label>
                  <select
                    name="weight_unit"
                    value={settings.weight_unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="lb">Pounds (lb)</option>
                    <option value="oz">Ounces (oz)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimension Unit
                  </label>
                  <select
                    name="dimension_unit"
                    value={settings.dimension_unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cm">Centimeters (cm)</option>
                    <option value="m">Meters (m)</option>
                    <option value="mm">Millimeters (mm)</option>
                    <option value="in">Inches (in)</option>
                    <option value="ft">Feet (ft)</option>
                  </select>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'checkout' && (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Checkout Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enable_customer_accounts"
                      checked={settings.enable_customer_accounts}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable customer accounts
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enable_guest_checkout"
                      checked={settings.enable_guest_checkout}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable guest checkout
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="require_phone"
                      checked={settings.require_phone}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Require phone number during checkout
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enable_coupon_codes"
                      checked={settings.enable_coupon_codes}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable coupon codes
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enable_reviews"
                      checked={settings.enable_reviews}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable product reviews
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="approval_required"
                      checked={settings.approval_required}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Require approval for reviews
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'shipping' && (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="shipping_calculator"
                      checked={settings.shipping_calculator}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable shipping calculator
                    </span>
                  </label>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flat Rate Shipping Cost
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{settings.currency_symbol}</span>
                    </div>
                    <input
                      type="number"
                      name="flat_rate_shipping"
                      value={settings.flat_rate_shipping}
                      onChange={handleInputChange}
                      className={`w-full pl-7 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.flat_rate_shipping ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  {errors.flat_rate_shipping && (
                    <p className="mt-1 text-sm text-red-600">{errors.flat_rate_shipping}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Set to 0 to disable flat rate shipping
                  </p>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free Shipping Threshold
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{settings.currency_symbol}</span>
                    </div>
                    <input
                      type="number"
                      name="free_shipping_threshold"
                      value={settings.free_shipping_threshold}
                      onChange={handleInputChange}
                      className={`w-full pl-7 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.free_shipping_threshold ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  {errors.free_shipping_threshold && (
                    <p className="mt-1 text-sm text-red-600">{errors.free_shipping_threshold}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Set to 0 to disable free shipping
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Tax Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enable_taxes"
                      checked={settings.enable_taxes}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable taxes
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Calculation
                  </label>
                  <select
                    name="tax_calculation"
                    value={settings.tax_calculation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!settings.enable_taxes}
                  >
                    <option value="shipping">Based on shipping address</option>
                    <option value="billing">Based on billing address</option>
                    <option value="store">Based on store address</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Display
                  </label>
                  <select
                    name="tax_display"
                    value={settings.tax_display}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!settings.enable_taxes}
                  >
                    <option value="inclusive">Including tax</option>
                    <option value="exclusive">Excluding tax</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    name="default_tax_rate"
                    value={settings.default_tax_rate}
                    onChange={handleInputChange}
                    min={0}
                    max={100}
                    step={0.01}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!settings.enable_taxes}
                  />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'policies' && (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Policies</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms and Conditions
                  </label>
                  <RichTextEditor
                    initialContent={settings.terms_and_conditions}
                    onChange={(content) => handleRichTextChange(content, 'terms_and_conditions')}
                    height="300px"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Privacy Policy
                  </label>
                  <RichTextEditor
                    initialContent={settings.privacy_policy}
                    onChange={(content) => handleRichTextChange(content, 'privacy_policy')}
                    height="300px"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Policy
                  </label>
                  <RichTextEditor
                    initialContent={settings.return_policy}
                    onChange={(content) => handleRichTextChange(content, 'return_policy')}
                    height="300px"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Policy
                  </label>
                  <RichTextEditor
                    initialContent={settings.shipping_policy}
                    onChange={(content) => handleRichTextChange(content, 'shipping_policy')}
                    height="300px"
                  />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'seo' && (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={settings.meta_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    If left empty, the store name will be used
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={settings.meta_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={settings.meta_keywords}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Comma separated keywords
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Analytics</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    name="google_analytics_id"
                    value={settings.google_analytics_id}
                    onChange={handleInputChange}
                    placeholder="UA-XXXXXXXX-X or G-XXXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    name="facebook_pixel_id"
                    value={settings.facebook_pixel_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="px-6 py-3 bg-gray-50 text-right">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreSettings;