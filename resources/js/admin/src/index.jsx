import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './store/AuthContext';
import { AppProvider } from './store/AppContext';

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<AppProvider>
					<App />
				</AppProvider>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);
