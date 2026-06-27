import axios, { type AxiosResponse } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
})

// Request interceptor: attach JWT bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      toast.error('登录已过期，请重新登录')
      useAuthStore.getState().auth.reset()
      // Redirect to sign-in preserving current location
      if (!window.location.pathname.startsWith('/sign-in')) {
        const redirect = encodeURIComponent(window.location.pathname)
        window.location.href = `/sign-in?redirect=${redirect}`
      }
    }
    return Promise.reject(error)
  }
)
