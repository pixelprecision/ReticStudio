// resources/js/admin/src/pages/PublicPage/PublicPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicPage, getPreviewPage } from '../../api/pagesApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageRenderer from '../../components/pageRenderer/PageRenderer';

const PublicPage = ({ isPreview = false }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        // Use the appropriate API method based on whether this is a preview
        const response = isPreview 
          ? await getPreviewPage(slug)
          : await getPublicPage(slug);
        
        setPage(response.data);
        setError(null);
        
        // Update document title with page title
        if (response.data && response.data.title) {
          document.title = response.data.title;
        }
        
        // Update meta description if available
        if (response.data && response.data.meta_description) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', response.data.meta_description);
          } else {
            const newMetaDesc = document.createElement('meta');
            newMetaDesc.setAttribute('name', 'description');
            newMetaDesc.setAttribute('content', response.data.meta_description);
            document.head.appendChild(newMetaDesc);
          }
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError(err.response?.data?.error || 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug, isPreview]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl mb-4">Page not found</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="public-page">
      {isPreview && (
        <div className="bg-blue-600 text-white p-3 text-center sticky top-0 z-50">
          Preview Mode - This page may not be published
          <button
            onClick={() => navigate(-1)}
            className="ml-4 px-3 py-1 bg-white text-blue-600 rounded-lg text-sm"
          >
            Back to Editor
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Only show title and description at the top if not included in content */}
        {!page.content?.some(comp => comp.type === 'heading' && comp.props?.text === page.title) && (
          <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
        )}
        
        {page.description && !page.content?.some(comp => 
          comp.type === 'text' && comp.props?.content?.includes(page.description)
        ) && (
          <div className="text-lg text-gray-600 mb-8">{page.description}</div>
        )}

        {page.featured_image_url && (
          <div className="mb-8">
            <img
              src={page.featured_image_url}
              alt={page.title}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="page-content">
          <PageRenderer content={page.content} />
        </div>
      </div>
    </div>
  );
};

export default PublicPage;