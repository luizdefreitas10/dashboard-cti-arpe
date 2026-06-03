import { api } from '@/services/apiClient'
import { handleAxiosError } from '@/services/error'
import type { UserRole } from '@/services/models/auth'

export interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
  active: boolean
}

export interface UpdateUserInput {
  name: string
  email: string
  role: UserRole
  active: boolean
}

export default function UsersService() {
  async function list(): Promise<SystemUser[]> {
    try {
      const { data } = await api.get<{ users: SystemUser[] }>('/users')
      return data.users ?? []
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function create(input: CreateUserInput): Promise<SystemUser> {
    try {
      const { data } = await api.post<{ user: SystemUser }>('/users', input)
      return data.user
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function update(id: string, input: UpdateUserInput): Promise<SystemUser> {
    try {
      const { data } = await api.patch<{ user: SystemUser }>(`/users/${id}`, input)
      return data.user
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function resetPassword(id: string, password: string): Promise<SystemUser> {
    try {
      const { data } = await api.patch<{ user: SystemUser }>(`/users/${id}/password`, { password })
      return data.user
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  return { list, create, update, resetPassword }
}
