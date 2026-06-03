'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AuthService, { AuthUser, BootstrapAdminInput, LoginInput } from '@/services/models/auth'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  refreshUser: () => Promise<AuthUser | null>
  login: (input: LoginInput) => Promise<AuthUser>
  bootstrapAdmin: (input: BootstrapAdminInput) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const service = useMemo(() => AuthService(), [])
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await service.me()
      setUser(currentUser)
      return currentUser
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  async function login(input: LoginInput) {
    const loggedUser = await service.login(input)
    setUser(loggedUser)
    return loggedUser
  }

  async function bootstrapAdmin(input: BootstrapAdminInput) {
    const admin = await service.bootstrapAdmin(input)
    setUser(admin)
    return admin
  }

  async function logout() {
    await service.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, login, bootstrapAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
