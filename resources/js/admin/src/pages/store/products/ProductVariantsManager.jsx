import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storeApi } from '../../../api/storeApi';
import PageHeader from '../../../components/common/PageHeader';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const ProductVariantsManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, variantId: null });
  
  // New variant form state
  const [showNewVariantForm, setShowNewVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    name: '',
    display_name: '',
    price: '',
    sale_price: '',
    display_type: 'dropdown',
    display_style: 'dropdown',
    is_required: true,
    options: [{ value: '', label: '', is_default: true }]
  });
  
  // Fetch product and variants data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, variantsResponse] = await Promise.all([
          storeApi.getProduct(id),
          storeApi.getProductVariants(id)
        ]);
        
        setProduct(productResponse.data);
        setVariants(variantsResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load product data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle opening the delete confirmation dialog
  const handleConfirmDelete = (variantId) => {
    setConfirmDelete({ isOpen: true, variantId });
  };
  
  // Handle deleting a variant
  const handleDeleteVariant = async () => {
    try {
      await storeApi.deleteProductVariant(id, confirmDelete.variantId);
      
      // Update local state to remove the deleted variant
      setVariants(variants.filter(variant => variant.id !== confirmDelete.variantId));
      setSuccessMessage('Variant deleted successfully');
      
      // Close the dialog
      setConfirmDelete({ isOpen: false, variantId: null });
    } catch (error) {
      console.error('Error deleting variant:', error);
      setError('Failed to delete variant');
      setConfirmDelete({ isOpen: false, variantId: null });
    }
  };
  
  // Handle variant form input change
  const handleVariantChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewVariant({
      ...newVariant,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle variant option change
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...newVariant.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === 'is_default' ? true : value
    };
    
    // If setting a new default, unset others
    if (field === 'is_default') {
      updatedOptions.forEach((option, i) => {
        if (i !== index) {
          updatedOptions[i] = { ...updatedOptions[i], is_default: false };
        }
      });
    }
    
    setNewVariant({
      ...newVariant,
      options: updatedOptions
    });
  };
  
  // Add new option to variant
  const handleAddOption = () => {
    setNewVariant({
      ...newVariant,
      options: [
        ...newVariant.options,
        { value: '', label: '', is_default: false }
      ]
    });
  };
  
  // Remove option from variant
  const handleRemoveOption = (index) => {
    // Don't remove if it's the only option
    if (newVariant.options.length <= 1) return;
    
    const updatedOptions = newVariant.options.filter((_, i) => i !== index);
    
    // If we removed the default option, make the first one default
    const hasDefault = updatedOptions.some(opt => opt.is_default);
    if (!hasDefault && updatedOptions.length > 0) {
      updatedOptions[0] = { ...updatedOptions[0], is_default: true };
    }
    
    setNewVariant({
      ...newVariant,
      options: updatedOptions
    });
  };
  
  // Save new variant
  const handleSaveVariant = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // Format the data for API
      const variantData = {
        ...newVariant,
        price: parseFloat(newVariant.price) || 0,
        sale_price: newVariant.sale_price ? parseFloat(newVariant.sale_price) : null,
      };
      
      const response = await storeApi.createProductVariant(id, variantData);
      
      // Add the new variant to the list
      setVariants([...variants, response.data]);
      
      // Reset form and show success message
      setNewVariant({
        name: '',
        display_name: '',
        price: '',
        sale_price: '',
        display_type: 'dropdown',
        display_style: 'dropdown',
        is_required: true,
        options: [{ value: '', label: '', is_default: true }]
      });
      
      setShowNewVariantForm(false);
      setSuccessMessage('Variant added successfully');
    } catch (error) {
      console.error('Error saving variant:', error);
      setError(error.response?.data?.message || 'Failed to save variant');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={`Manage Variants: ${product?.name}`}
        backUrl={`/admin/store/products/${id}`} 
      />
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Variants List */}
      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Product Variants</h3>
          <button 
            onClick={() => setShowNewVariantForm(!showNewVariantForm)}
            className="bg-blue-500 text-white rounded-md px-4 py-2"
          >
            {showNewVariantForm ? 'Cancel' : 'Add Variant'}
          </button>
        </div>
        
        {variants.length === 0 && !showNewVariantForm ? (
          <p className="text-gray-600 italic">This product has no variants. Click 'Add Variant' to create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Name
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Type
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variants.map(variant => (
                  <tr key={variant.id}>
                    <td className="py-3 px-4">{variant.name}</td>
                    <td className="py-3 px-4">{variant.display_name}</td>
                    <td className="py-3 px-4">{variant.display_type}</td>
                    <td className="py-3 px-4">{variant.is_required ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4">{variant.options?.length || 0} options</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button 
                        onClick={() => navigate(`/admin/store/products/${id}/variants/${variant.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleConfirmDelete(variant.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* New Variant Form */}
        {showNewVariantForm && (
          <div className="mt-6 border-t pt-6">
            <h4 className="text-md font-medium mb-4">Add New Variant</h4>
            <form onSubmit={handleSaveVariant}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-medium">Variant Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newVariant.name} 
                    onChange={handleVariantChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="e.g. Size, Color, Material"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Display Name</label>
                  <input 
                    type="text" 
                    name="display_name" 
                    value={newVariant.display_name} 
                    onChange={handleVariantChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="e.g. Select a size"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Base Price Adjustment</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={newVariant.price} 
                    onChange={handleVariantChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="0.00"
                    step="0.01"
                  />
                  <span className="text-xs text-gray-500">Amount to add to product base price</span>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Sale Price Adjustment</label>
                  <input 
                    type="number" 
                    name="sale_price" 
                    value={newVariant.sale_price} 
                    onChange={handleVariantChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Display Type</label>
                  <select 
                    name="display_type" 
                    value={newVariant.display_type} 
                    onChange={handleVariantChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="dropdown">Dropdown</option>
                    <option value="radio">Radio Buttons</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="swatch">Color Swatch</option>
                    <option value="text">Text Field</option>
                    <option value="text_area">Multiline Text Field</option>
                    <option value="date">Date Field</option>
                    <option value="number">Number Field</option>
                    <option value="file">File Upload</option>
                    <option value="product_list">Product Pick List</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Display Style</label>
                  <select 
                    name="display_style" 
                    value={newVariant.display_style} 
                    onChange={handleVariantChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    disabled={!['dropdown', 'radio', 'swatch'].includes(newVariant.display_type)}
                  >
                    <option value="dropdown">Dropdown</option>
                    <option value="radio">Radio Buttons</option>
                    <option value="buttons">Button Group</option>
                    <option value="swatches">Color Swatches</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center mb-2 font-medium">
                    <input 
                      type="checkbox" 
                      name="is_required" 
                      checked={newVariant.is_required} 
                      onChange={handleVariantChange}
                      className="mr-2"
                    />
                    Required Option
                  </label>
                </div>
              </div>
              
              {/* Options Section */}
              <div className="mt-6 border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium">Variant Options</h4>
                  <button 
                    type="button"
                    onClick={handleAddOption}
                    className="bg-gray-200 text-gray-700 rounded-md px-3 py-1 text-sm"
                  >
                    Add Option
                  </button>
                </div>
                
                {newVariant.options.map((option, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Option {index + 1}</h5>
                      <button 
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500 text-sm"
                        disabled={newVariant.options.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Value</label>
                        <input 
                          type="text" 
                          value={option.value} 
                          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2"
                          placeholder="e.g. red, large, cotton"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium">Display Label</label>
                        <input 
                          type="text" 
                          value={option.label} 
                          onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2"
                          placeholder="e.g. Red, Large, Cotton"
                        />
                      </div>
                      
                      <div className="flex items-center mt-6">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="radio" 
                            checked={option.is_default} 
                            onChange={() => handleOptionChange(index, 'is_default')}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2 text-sm font-medium">Default Option</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setShowNewVariantForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Variant'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => navigate(`/admin/store/products/${id}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md"
        >
          Done
        </button>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Variant"
        message="Are you sure you want to delete this variant? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteVariant}
        onCancel={() => setConfirmDelete({ isOpen: false, variantId: null })}
      />
    </div>
  );
};

export default ProductVariantsManager;