import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  loginPath?: string
}

export function ProtectedRoute({
  children,
  loginPath = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return <div className="text-center py-5">Cargando...</div>
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location }}
        replace
      />
    )
  }

  return <>{children}</>
}
