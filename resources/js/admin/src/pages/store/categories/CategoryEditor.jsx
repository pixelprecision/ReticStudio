import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storeApi } from '../../../api/storeApi';
import PageHeader from '../../../components/common/PageHeader';
import RichTextEditor from '../../../components/editors/RichTextEditor';
import MediaChooser from '../../../components/media/MediaChooser';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const CategoryEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Category state
  const [category, setCategory] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: null,
    image: '',
    template_layout: 'default',
    sort_order: 0,
    default_product_sort: 'featured',
    is_visible: true,
    is_featured: false,
    seo_title: '',
    seo_keywords: '',
    seo_description: ''
  });

  // Fetch categories for parent dropdown
  const [categories, setCategories] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories for parent dropdown
        const categoriesResponse = await storeApi.getCategories();
        setCategories(categoriesResponse.data.data.data);

        // If editing, fetch the category
        if (isEditing) {
          const categoryResponse = await storeApi.getCategory(id);
          setCategory(categoryResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategory(prevCategory => ({
      ...prevCategory,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle rich text editor changes
  const handleRichTextChange = (content) => {
    setCategory(prevCategory => ({
      ...prevCategory,
      description: content
    }));
  };

  // Handle media selection
  const handleMediaSelect = (field, media) => {
    setCategory(prevCategory => ({
      ...prevCategory,
      [field]: media.path
    }));
  };

  // Generate slug from name
  const generateSlug = () => {
    const slug = category.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setCategory(prevCategory => ({
      ...prevCategory,
      slug
    }));
  };

  // Save category
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      if (isEditing) {
        await storeApi.updateCategory(id, category);
      } else {
        await storeApi.createCategory(category);
      }

      setSuccessMessage('Category saved successfully');

      // Redirect to category list after a short delay
      setTimeout(() => {
        navigate('/admin/store/categories');
      }, 1500);
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  // Filter out the current category and its children from parent options
  const getFilteredParentOptions = () => {
    if (!isEditing) return categories;

    // Helper function to get all descendant IDs
    const getDescendantIds = (categoryId, categoriesList) => {
      const directChildren = categoriesList.filter(c => c.parent_id === categoryId);
      const childIds = directChildren.map(c => c.id);

      // Recursively get descendants of each child
      const descendantIds = directChildren.flatMap(child =>
        getDescendantIds(child.id, categoriesList)
      );

      return [...childIds, ...descendantIds];
    };

    const currentCategoryId = parseInt(id);
    const descendantIds = getDescendantIds(currentCategoryId, categories);
    const excludedIds = [currentCategoryId, ...descendantIds];

    return categories.filter(c => !excludedIds.includes(c.id));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={isEditing ? 'Edit Category' : 'Add New Category'}
        backUrl="/admin/store/categories"
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

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Category Name</label>
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Slug</label>
              <div className="flex">
                <input
                  type="text"
                  name="slug"
                  value={category.slug}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-l-md p-2"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="bg-gray-200 text-gray-700 px-4 rounded-r-md"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">Parent Category</label>
              <select
                name="parent_id"
                value={category.parent_id || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">None (Top Level Category)</option>
                {getFilteredParentOptions().map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Template Layout</label>
              <select
                name="template_layout"
                value={category.template_layout}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="default">Default Grid Layout</option>
                <option value="list">List Layout</option>
                <option value="masonry">Masonry Grid Layout</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Sort Order</label>
              <input
                type="number"
                name="sort_order"
                value={category.sort_order}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Default Product Sort</label>
              <select
                name="default_product_sort"
                value={category.default_product_sort}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="featured">Featured Items</option>
                <option value="newest">Newest Items</option>
                <option value="bestselling">Best Selling</option>
                <option value="a-z">Alphabetical A to Z</option>
                <option value="z-a">Alphabetical Z to A</option>
                <option value="reviews">Average Customer Review</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
              </select>
            </div>

            <div>
              <label className="flex items-center mb-2 font-medium">
                <input
                  type="checkbox"
                  name="is_visible"
                  checked={category.is_visible}
                  onChange={handleChange}
                  className="mr-2"
                />
                Visible in Store
              </label>
            </div>

            <div>
              <label className="flex items-center mb-2 font-medium">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={category.is_featured}
                  onChange={handleChange}
                  className="mr-2"
                />
                Featured Category
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">Description</h3>

          <RichTextEditor
            value={category.description}
            onChange={handleRichTextChange}
          />
        </div>

        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">Category Image</h3>

          <MediaChooser
            value={category.image}
            onChange={(media) => handleMediaSelect('image', media)}
            mediaType="image"
          />
        </div>

        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">SEO Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Meta Title</label>
              <input
                type="text"
                name="meta_title"
                value={category.meta_title || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Leave blank to use category name"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Meta Keywords</label>
              <input
                type="text"
                name="meta_keywords"
                value={category.meta_keywords || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Comma-separated keywords"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Meta Description</label>
              <textarea
                name="meta_description"
                value={category.meta_description || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/store/categories')}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryEditor;
