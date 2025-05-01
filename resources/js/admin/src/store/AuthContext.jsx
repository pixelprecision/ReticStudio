// resources/js/admin/src/store/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [loading, setLoading] = useState(true)
	const [token, setToken] = useState(localStorage.getItem('token'))

	useEffect(() => {
		const initAuth = async () => {
			if (token) {
				setAuthToken(token)
				try {
					const res = await axios.get('/api/auth/user-profile')
					setUser(res.data)
					setIsAuthenticated(true)
				} catch (error) {
					localStorage.removeItem('token')
					setToken(null)
					setAuthToken(null)
				}
			}
			setLoading(false)
		}

		initAuth()
	}, [token])

	const login = async (credentials) => {
		try {
			const res = await axios.post('/api/auth/login', credentials)
			const { access_token, user } = res.data

			localStorage.setItem('token', access_token)
			setToken(access_token)
			setAuthToken(access_token)
			setUser(user)
			setIsAuthenticated(true)

			return { success: true }
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.error || 'Login failed'
			}
		}
	}

	const logout = async () => {
		try {
			await axios.post('/api/auth/logout')
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			localStorage.removeItem('token')
			setToken(null)
			setAuthToken(null)
			setUser(null)
			setIsAuthenticated(false)
		}
	}

	const setAuthToken = (token) => {
		if (token) {
			axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
		} else {
			delete axios.defaults.headers.common['Authorization']
		}
	}

	const value = {
		user,
		isAuthenticated,
		loading,
		login,
		logout
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
