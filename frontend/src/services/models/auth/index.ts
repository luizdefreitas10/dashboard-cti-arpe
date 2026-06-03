import { api } from '@/services/apiClient'
import { handleAxiosError } from '@/services/error'

export type UserRole = 'admin' | 'agent'

export interface AuthUser {
  id?: string
  sub?: string
  name: string
  email: string
  role: UserRole
  active?: boolean
  lastLoginAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface BootstrapAdminInput extends LoginInput {
  name: string
}

export default function AuthService() {
  async function me(): Promise<AuthUser> {
    try {
      const { data } = await api.get<{ user: AuthUser }>('/auth/me')
      return data.user
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function login(input: LoginInput): Promise<AuthUser> {
    try {
      const { data } = await api.post<{ user: AuthUser }>('/auth/login', input)
      return data.user
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function bootstrapStatus(): Promise<{ canBootstrap: boolean }> {
    try {
      const { data } = await api.get<{ canBootstrap: boolean }>('/auth/bootstrap-status')
      return data
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function bootstrapAdmin(input: BootstrapAdminInput): Promise<AuthUser> {
    try {
      const { data } = await api.post<{ user: AuthUser }>('/auth/bootstrap-admin', input)
      return data.user
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  return { me, login, logout, bootstrapStatus, bootstrapAdmin }
}
