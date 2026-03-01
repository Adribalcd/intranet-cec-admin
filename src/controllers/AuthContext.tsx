/**
 * Controlador: estado global de autenticación (JWT solo admin)
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { adminApi } from '../models/adminApi'
import {
  getStoredToken,
  setStoredToken,
  clearStoredAuth,
} from '../config/api'

interface AuthState {
  token: string | null
  isReady: boolean
}

interface AuthContextValue extends AuthState {
  login: (usuario: string, contrasena: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    isReady: false,
  })

  const initFromStorage = useCallback(() => {
    const token = getStoredToken()
    setState({ token, isReady: true })
  }, [])

  useEffect(() => {
    initFromStorage()
  }, [initFromStorage])

  useEffect(() => {
    const onUnauthorized = () =>
      setState({ token: null, isReady: true })

    window.addEventListener('cec-unauthorized', onUnauthorized)
    return () =>
      window.removeEventListener('cec-unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (usuario: string, contrasena: string) => {
    const { data } = await adminApi.login({ usuario, contrasena })

    if (data.token) {
      setStoredToken(data.token)
      setState({ token: data.token, isReady: true })
    }
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setState({ token: null, isReady: true })
  }, [])

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    isAuthenticated: !!state.token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}