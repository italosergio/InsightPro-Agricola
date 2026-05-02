import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'
import type { ReactNode } from 'react'

export function AuthRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : children
}
