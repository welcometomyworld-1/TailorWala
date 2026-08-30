import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create an Axios instance with timeout
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: inject authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor: standard unwrap and 401 expiration handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new CustomEvent('tailorwala:auth-expired'))
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred. Please try again.'

    const customError = new Error(message)
    customError.status = error.response?.status
    customError.data = error.response?.data
    return Promise.reject(customError)
  },
)

export const apiGet = (path, config = {}) => {
  return apiClient.get(path, config)
}

export const apiPost = (path, data = {}, config = {}) => {
  return apiClient.post(path, data, config)
}

export const apiPut = (path, data = {}, config = {}) => {
  return apiClient.put(path, data, config)
}

export const apiPatch = (path, data = {}, config = {}) => {
  return apiClient.patch(path, data, config)
}

export const apiDelete = (path, config = {}) => {
  return apiClient.delete(path, config)
}

export default apiClient
