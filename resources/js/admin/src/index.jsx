import './polyfills'; // Must be first import
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './store/AuthContext';
import { AppProvider } from './store/AppContext';
import {ThemeProvider} from "./store/ThemeContext.jsx";

// Initialize dropdown handler
document.addEventListener('DOMContentLoaded', () => {
  // Close any open dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  });
});

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<AppProvider>
					<ThemeProvider>
						<App />
					</ThemeProvider>
				</AppProvider>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);
