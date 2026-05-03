import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthContextType } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const VALID_CREDENTIALS: Record<string, string> = {
  'narcisoneto': 'narcisoo',
  'admin': 'admin',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('insightpro_auth') === 'true'
  })

  const login = (username: string, password: string): boolean => {
    if (VALID_CREDENTIALS[username] === password) {
      setIsAuthenticated(true)
      sessionStorage.setItem('insightpro_auth', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('insightpro_auth')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
