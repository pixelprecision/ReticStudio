// resources/js/admin/src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/AuthContext'
import { CacheProvider } from './store/CacheContext'
import FontLoader from './components/layout/FontLoader'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layout Components
import AdminLayout from './components/layout/AdminLayout'
import AuthLayout from './components/layout/AuthLayout'

// Auth Pages
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword.jsx'

// Admin Pages
import Dashboard from './pages/dashboard/Dashboard'
import PagesList from './pages/PagesList/PagesList'
import PageEditor from './pages/PageEditor/PageEditor'
import LivePageEditor from './pages/PageEditor/LivePageEditor'
import FormsList from './pages/forms/FormsList.jsx'
import ComponentsList from './pages/components/ComponentsList'
import ComponentEditor from './pages/components/ComponentEditor'

// Public Pages
import PublicPage from './pages/PublicPage/PublicPage'

// Missing Components to Build
import FormEditor from './pages/forms/FormEditor'
import FormSubmissions from './pages/forms/FormSubmissions'
import MediaLibrary from './pages/media/MediaLibrary'
import Settings from './pages/settings/Settings'
import ThemesList from './pages/themes/ThemesList'
import ThemeEditor from './pages/themes/ThemeEditor'
import MenusList from './pages/menus/MenusList'
import MenuEditor from './pages/menus/MenuEditor'
import PluginsList from './pages/plugins/PluginsList'
import PluginEditor from './pages/plugins/PluginEditor'
import HeaderEditor from './pages/header/HeaderEditor'
import FooterEditor from './pages/footer/FooterEditor'

// Private Route component
const PrivateRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth()

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		)
	}

	return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />
}

// Public Route component (accessible only when not authenticated)
const PublicRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth()

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		)
	}

	return !isAuthenticated ? <>{children}</> : <Navigate to="/admin/dashboard" />
}

const App = () => {
	return (
		<CacheProvider>
			<FontLoader />
			{/* Add ToastContainer for notifications */}
			<ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
			<Routes>
				{/* Auth Routes */}
				<Route path="/admin" element={<PublicRoute><AuthLayout /></PublicRoute>}>
					<Route path="login" element={<Login />} />
					<Route path="forgot-password" element={<ForgotPassword />} />
					<Route path="reset-password" element={<ResetPassword />} />
					<Route index element={<Navigate to="/admin/login" />} />
				</Route>

				{/* Admin Routes */}
				<Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
					<Route path="dashboard" element={<Dashboard />} />

					{/* Pages */}
					<Route path="pages" element={<PagesList />} />
					<Route path="pages/create" element={<PageEditor />} />
					<Route path="pages/edit/:id" element={<PageEditor />} />
					<Route path="pages/create-live" element={<LivePageEditor />} />
					<Route path="pages/edit-live/:id" element={<LivePageEditor />} />

					{/* Components */}
					<Route path="components" element={<ComponentsList />} />
					<Route path="components/create" element={<ComponentEditor />} />
					<Route path="components/edit/:id" element={<ComponentEditor />} />

					{/* Forms */}
					<Route path="forms" element={<FormsList />} />
					<Route path="forms/create" element={<FormEditor />} />
					<Route path="forms/edit/:id" element={<FormEditor />} />
					<Route path="forms/submissions/:id" element={<FormSubmissions />} />

					{/* Media */}
					<Route path="media" element={<MediaLibrary />} />

					{/* Settings */}
					<Route path="settings" element={<Settings />} />
					<Route path="settings/:group" element={<Settings />} />

					{/* Themes */}
					<Route path="themes" element={<ThemesList />} />
					<Route path="themes/create" element={<ThemeEditor />} />
					<Route path="themes/edit/:id" element={<ThemeEditor />} />

					{/* Menus */}
					<Route path="menus" element={<MenusList />} />
					<Route path="menus/create" element={<MenuEditor />} />
					<Route path="menus/edit/:id" element={<MenuEditor />} />

					{/* Plugins */}
					<Route path="plugins" element={<PluginsList />} />
					<Route path="plugins/edit/:id" element={<PluginEditor />} />

					{/* Header */}
					<Route path="header" element={<HeaderEditor />} />
					
					{/* Footer */}
					<Route path="footer" element={<FooterEditor />} />
				</Route>

				{/* Home page route */}
				<Route path="/" element={<PublicPage isPreview={false} isHomePage={true} />} />

				{/* Public Page Routes */}
				<Route path="/:slug" element={<PublicPage isPreview={false} />} />
				<Route path="/preview/:slug" element={<PublicPage isPreview={true} />} />

				{/* Fallback - redirect to admin dashboard if authenticated, or login if not */}
				<Route path="*" element={<Navigate to="/admin/dashboard" />} />
			</Routes>
		</CacheProvider>
	)
}

export default App