/**
 * Cliente API - Intranet CEC
 * Base URL desde env. Header Authorization Bearer se añade en interceptors.
 */
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ||'https://intranet-cec-api.onrender.com'

export const api = axios.create({
  baseURL,
})

const TOKEN_KEY = 'cec_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // No establecer Content-Type si FormData; dejar que axios lo maneje
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearStoredAuth()
      window.dispatchEvent(new Event('cec-unauthorized'))
    }
    return Promise.reject(err)
  }
)

export default api
