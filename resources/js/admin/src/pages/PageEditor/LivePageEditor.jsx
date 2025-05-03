// resources/js/admin/src/pages/PageEditor/LivePageEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPage, updatePage, createPage } from '../../api/pagesApi';
import { showToast } from '../../api/apiClient';
import LiveBuilder from '../../components/pageBuilder/LiveBuilder';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LivePageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // State for the page data
  const [pageData, setPageData] = useState({
    title: '',
    slug: '',
    description: '',
    content: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    layout: '',
    is_published: false,
  });

  // Fetch page data if editing an existing page
  useEffect(() => {
    if (isEditing) {
      fetchPage();
    }
  }, [id]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const response = await getPage(id);
      const pageData = response.data;

      // Parse content properly - handle both string and array formats
      let contentArray = [];
      if (pageData.content) {
        if (Array.isArray(pageData.content)) {
          contentArray = pageData.content;
        } else if (typeof pageData.content === 'string') {
          try {
            // Try to parse if it's a JSON string
            contentArray = JSON.parse(pageData.content);
            if (!Array.isArray(contentArray)) {
              console.warn('Content parsed to non-array value:', contentArray);
              contentArray = [];
            }
          } catch (e) {
            console.error('Error parsing page content string:', e);
            contentArray = [];
          }
        } else {
          console.warn('Unexpected content format:', typeof pageData.content);
        }
      }

      setPageData({
        title: pageData.title || '',
        slug: pageData.slug || '',
        description: pageData.description || '',
        content: contentArray,
        meta_title: pageData.meta_title || '',
        meta_description: pageData.meta_description || '',
        meta_keywords: pageData.meta_keywords || '',
        layout: pageData.layout || '',
        is_published: pageData.is_published || false,
      });
    } catch (error) {
      console.error('Error fetching page:', error);
      showToast('Error', 'Failed to fetch page data', 'error');
      navigate('/admin/pages');
    } finally {
      setLoading(false);
    }
  };

  // Handle content changes from the LiveBuilder
  const handleContentChange = (newContent) => {
    console.log('LivePageEditor received content update with length:', newContent.length);
    
    // Use a callback to ensure we're working with the latest state
    setPageData(prev => {
      const updatedData = {
        ...prev,
        content: Array.isArray(newContent) ? newContent : []
      };
      console.log('Updated pageData with new content:', updatedData);
      return updatedData;
    });
  };

  // Save page data to the server
  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      // Log the current state before saving
      console.log('Saving page data:', pageData);
      console.log('Content array length:', Array.isArray(pageData.content) ? pageData.content.length : 'not an array');
      
      // Create a fresh deep copy of the page data to ensure proper serialization
      const pageDataCopy = JSON.parse(JSON.stringify(pageData));

      // Ensure content array is serialized properly
      if (!Array.isArray(pageDataCopy.content)) {
        console.warn('Content is not an array before saving, fixing:', pageDataCopy.content);
        // Ensure content is at least an empty array if it's not already an array
        pageDataCopy.content = [];
      }

      if (isEditing) {
        const response = await updatePage(id, pageDataCopy);
        console.log('Update response:', response);
        showToast('Success', 'Page updated successfully', 'success');
      } else {
        const response = await createPage(pageDataCopy);
        console.log('Create response:', response);
        showToast('Success', 'Page created successfully', 'success');
        // Navigate to the edit page for the new page
        navigate(`/admin/pages/edit-live/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
        showToast('Error', 'Please fix the highlighted errors', 'error');
      } else {
        showToast('Error', 'Failed to save page', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Exit the LiveBuilder and go back to pages list
  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Any unsaved changes will be lost.')) {
      navigate('/admin/pages');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="live-page-editor">
      <LiveBuilder
        value={pageData.content}
        onChange={handleContentChange}
        onSave={handleSave}
        onExit={handleExit}
        pageData={pageData}
      />
    </div>
  );
};

export default LivePageEditor;