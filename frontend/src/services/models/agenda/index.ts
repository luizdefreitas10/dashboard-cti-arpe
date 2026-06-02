import { api } from '@/services/apiClient'
import { handleAxiosError } from '@/services/error'
import type { AxiosRequestConfig } from 'axios'

export interface AgendaReuniao {
  id: string
  tema: string
  data: string
  horaInicio: string
  horaFim: string
  local: string
  descricaoPauta: string | null
  createdAt: string
  updatedAt: string
}

export interface AgendaReunioesResponse {
  reunioes: AgendaReuniao[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface AgendaReuniaoFilters {
  page?: number
  size?: number
  dataInicio?: string
  dataFim?: string
  ocorridasAteData?: string
  ocorridasAteHora?: string
  local?: string
  busca?: string
  ordem?: 'asc' | 'desc'
}

export interface CreateAgendaReuniaoInput {
  tema: string
  data: string
  horaInicio: string
  horaFim: string
  local: string
  descricaoPauta?: string
}

export type UpdateAgendaReuniaoInput = CreateAgendaReuniaoInput

export default function AgendaService() {
  async function findMany(
    filters: AgendaReuniaoFilters = {},
    config?: AxiosRequestConfig,
  ): Promise<AgendaReunioesResponse> {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
      )
      const { data } = await api.get<AgendaReunioesResponse>('/agenda/reunioes', { params, ...config })
      return data
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function create(input: CreateAgendaReuniaoInput): Promise<AgendaReuniao> {
    try {
      const { data } = await api.post<{ reuniao: AgendaReuniao }>('/agenda/reunioes', input)
      return data.reuniao
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function update(id: string, input: UpdateAgendaReuniaoInput): Promise<AgendaReuniao> {
    try {
      const { data } = await api.patch<{ reuniao: AgendaReuniao }>(`/agenda/reunioes/${id}`, input)
      return data.reuniao
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await api.delete(`/agenda/reunioes/${id}`)
    } catch (error) {
      throw handleAxiosError(error)
    }
  }

  return { findMany, create, update, remove }
}
