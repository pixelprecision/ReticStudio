// resources/js/admin/src/pages/PublicPage/PublicPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getPublicPage, getPreviewPage, getHomePage } from '../../api/pagesApi';
import { getPublicMenu } from '../../api/menusApi';
import { getActiveTheme } from '../../api/themesApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageRenderer from '../../components/pageRenderer/PageRenderer';
import ThemeLayout from '../../components/theme/ThemeLayout';
import ThemeTemplateRenderer from '../../components/theme/ThemeTemplateRenderer';
import { ThemeProvider } from '../../store/ThemeContext';
import ReactThemeRenderer from "../../components/theme/ReactThemeRenderer.jsx";

const PublicPage = ({ isPreview = false, isHomePage = false, pageType = null }) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("IN PUBLIC PAGE COMPONENT");
  useEffect(() => {
      console.log("IN PUBLIC PAGE EFFECT");
    const fetchPageData = async () => {
      setLoading(true);
      try {
        let pageResponse;
          console.log("IS HOME PAGE", window.isHomePage);

        // Handle different page types
        if (pageType === 'category_index') {
          // Get category index page
          pageResponse = await axios.get('/api/pages/category');
        } else if (pageType === 'category_single' && slug) {
          // Get specific category page
          pageResponse = await axios.get(`/api/pages/category/${slug}`);
        } else if (pageType === 'product_single' && slug) {
          // Get specific product page
          pageResponse = await axios.get(`/api/pages/product/${slug}`);
        } else if (isHomePage || window.isHomePage) {
          // Get homepage
          pageResponse = await getHomePage();
        } else if (isPreview) {
          // Get preview page
          pageResponse = await getPreviewPage(slug);
        } else {
          // Get regular page
          pageResponse = await getPublicPage(slug);
        }

        setPage(pageResponse.data);
        setError(null);

        // Update document title with page title
        if (pageResponse.data && pageResponse.data.title) {
          document.title = pageResponse.data.title;
        }

        // Update meta description if available
        if (pageResponse.data && pageResponse.data.meta_description) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', pageResponse.data.meta_description);
          } else {
            const newMetaDesc = document.createElement('meta');
            newMetaDesc.setAttribute('name', 'description');
            newMetaDesc.setAttribute('content', pageResponse.data.meta_description);
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

    // For homepage, we don't need a slug
    // For category index page, we don't need a slug either
    if (slug || window.isHomePage || isHomePage || pageType === 'category_index') {
      fetchPageData();
    }
  }, [slug, isPreview, isHomePage, pageType]);

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
    <>
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

      {/* Directly render the page content - the layout is now handled by PublicLayout */}
        <ReactThemeRenderer page={page} pageType={page.type}>
            <PageRenderer
                content={page.content}
                pageType={page.type}
                pageData={page}
            />
        </ReactThemeRenderer>

    </>
  );
};

export default PublicPage;
