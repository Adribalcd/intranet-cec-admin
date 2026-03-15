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

/** Decodifica el payload del JWT sin verificar firma (solo para UI) */
function decodeJwt(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

type RolAdmin = 'general' | 'academico' | 'pagos'

interface AuthState {
  token: string | null
  isReady: boolean
  rolAdmin: RolAdmin
  nombreAdmin: string
}

interface AuthContextValue extends AuthState {
  login: (usuario: string, contrasena: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const DEFAULT_STATE: AuthState = { token: null, isReady: false, rolAdmin: 'general', nombreAdmin: '' }

const AuthContext = createContext<AuthContextValue | null>(null)

function extractFromToken(token: string | null): Pick<AuthState, 'rolAdmin' | 'nombreAdmin'> {
  if (!token) return { rolAdmin: 'general', nombreAdmin: '' }
  const decoded = decodeJwt(token)
  return {
    rolAdmin:    (decoded?.rolAdmin as RolAdmin) || 'general',
    nombreAdmin: decoded?.nombre || '',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(DEFAULT_STATE)

  const initFromStorage = useCallback(() => {
    const token = getStoredToken()
    setState({ token, isReady: true, ...extractFromToken(token) })
  }, [])

  useEffect(() => {
    initFromStorage()
  }, [initFromStorage])

  useEffect(() => {
    const onUnauthorized = () =>
      setState({ token: null, isReady: true, rolAdmin: 'general', nombreAdmin: '' })

    window.addEventListener('cec-unauthorized', onUnauthorized)
    return () =>
      window.removeEventListener('cec-unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (usuario: string, contrasena: string) => {
    const { data } = await adminApi.login({ usuario, contrasena })

    if (data.token) {
      setStoredToken(data.token)
      setState({ token: data.token, isReady: true, ...extractFromToken(data.token) })
    }
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setState({ token: null, isReady: true, rolAdmin: 'general', nombreAdmin: '' })
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
