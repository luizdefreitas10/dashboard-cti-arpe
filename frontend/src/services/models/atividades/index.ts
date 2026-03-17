import { api } from '@/services/apiClient'
import { handleAxiosError } from '@/services/error'
import type { AxiosRequestConfig } from 'axios'

export interface Atividade {
  id: string
  categoria: string
  nome: string
  diaSemana?: string | null
  data?: string | null
  horario?: string | null
  responsavel?: string | null
  solicitante?: string | null
  setor?: string | null
  prioridade?: string | null
  estado?: string | null
  observacao?: string | null
}

export interface AtividadesResponse {
  atividades: Atividade[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface AtividadeFilters {
  page?: number
  size?: number
  dataInicio?: string
  dataFim?: string
  categoria?: string
  responsavel?: string
  setor?: string
  prioridade?: string
  busca?: string
}

export interface AtividadesStats {
  total: number
  porCategoria: { categoria: string; total: number }[]
  porSetor: { setor: string; total: number }[]
  porResponsavel: { responsavel: string; total: number }[]
  porPrioridade: { prioridade: string; total: number }[]
  porMes: { mes: string; total: number }[]
}

export default function AtividadesService() {
  async function findMany(filters: AtividadeFilters = {}, config?: AxiosRequestConfig): Promise<AtividadesResponse> {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
      )
      const { data } = await api.get<AtividadesResponse>('/atividades', { params, ...config })
      return data
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  async function getStats(config?: AxiosRequestConfig): Promise<AtividadesStats> {
    try {
      const { data } = await api.get<AtividadesStats>('/atividades/stats', config)
      return data
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  return { findMany, getStats }
}
