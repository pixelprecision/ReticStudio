// resources/js/admin/src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	const [token, setToken] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();

	// Extract token and email from URL query parameters
	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		const tokenParam = queryParams.get('token');
		const emailParam = queryParams.get('email');

		if (tokenParam) setToken(tokenParam);
		if (emailParam) setEmail(emailParam);
	}, [location]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== passwordConfirmation) {
			setMessage('Passwords do not match');
			setIsSuccess(false);
			return;
		}

		setLoading(true);
		setMessage('');

		try {
			const response = await axios.post('/api/auth/reset-password', {
				token,
				email,
				password,
				password_confirmation: passwordConfirmation
			});

			setIsSuccess(true);
			setMessage(response.data.message || 'Password has been reset successfully.');

			// Redirect to login page after a successful reset
			setTimeout(() => {
				navigate('/admin/login');
			}, 3000);
		} catch (error) {
			setIsSuccess(false);
			setMessage(
				error.response?.data?.message ||
				'An error occurred. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h2 className="text-center text-xl font-bold text-gray-900">
				Reset your password
			</h2>
			<p className="mt-2 text-center text-sm text-gray-600">
				Enter your new password below.
			</p>

			{message && (
				<div className={`mt-4 ${isSuccess ? 'bg-green-50 border-green-400 text-green-700' : 'bg-red-50 border-red-400 text-red-700'} p-3 rounded border-l-4`}>
					{message}
				</div>
			)}

			<form className="mt-6 space-y-6" onSubmit={handleSubmit}>
				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-700">
						Email address
					</label>
					<div className="mt-1">
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="form-input"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading || isSuccess}
						/>
					</div>
				</div>

				<div>
					<label htmlFor="password" className="block text-sm font-medium text-gray-700">
						New Password
					</label>
					<div className="mt-1">
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="new-password"
							required
							className="form-input"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading || isSuccess}
							minLength="8"
						/>
					</div>
				</div>

				<div>
					<label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
						Confirm New Password
					</label>
					<div className="mt-1">
						<input
							id="password_confirmation"
							name="password_confirmation"
							type="password"
							autoComplete="new-password"
							required
							className="form-input"
							value={passwordConfirmation}
							onChange={(e) => setPasswordConfirmation(e.target.value)}
							disabled={loading || isSuccess}
							minLength="8"
						/>
					</div>
				</div>

				<div>
					<button
						type="submit"
						className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						disabled={loading || isSuccess}
					>
						{loading ? (
							<>
								<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Resetting...
							</>
						) : isSuccess ? 'Password Reset' : 'Reset Password'}
					</button>
				</div>

				<div className="text-center">
					<Link to="/admin/login" className="text-sm text-blue-600 hover:text-blue-500">
						Return to login
					</Link>
				</div>
			</form>
		</>
	);
};

export default ResetPassword;
