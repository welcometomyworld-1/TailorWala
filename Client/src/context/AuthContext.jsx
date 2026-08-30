/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost, apiPut } from '../services/api.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const data = await apiGet('/auth/me')
      if (data?.user) {
        setUser(data.user)
      } else {
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()

    // Listen for auth expired event dispatched from API interceptor
    const handleAuthExpired = () => {
      setUser(null)
    }

    window.addEventListener('tailorwala:auth-expired', handleAuthExpired)
    return () => {
      window.removeEventListener('tailorwala:auth-expired', handleAuthExpired)
    }
  }, [restoreSession])

  const login = async (email, password) => {
    const data = await apiPost('/auth/login', { email, password })
    if (data.token) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
    }
    return data
  }

  const register = async (payload) => {
    const data = await apiPost('/auth/register', payload)
    if (data.token) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
    }
    return data
  }

  const updateProfile = async (profileData) => {
    const data = await apiPut('/auth/profile', profileData)
    if (data.user) {
      setUser(data.user)
    }
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isCustomer = user?.role === 'customer'
  const isTailor = user?.role === 'tailor'
  const isSuperAdmin = user?.role === 'super_admin'
  const isEmployee = user?.role === 'employee'
  const isAdmin = user?.role === 'admin' || isSuperAdmin || isEmployee

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        restoreSession,
        isAuthenticated: !!user,
        isCustomer,
        isTailor,
        isAdmin,
        isSuperAdmin,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
