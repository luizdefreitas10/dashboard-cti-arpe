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
  porMesPrioridade: { mes: string; prioridade: string; total: number }[]
  porDiaSemanaMes: { mes: string; diaSemana: string; total: number }[]
  porNomeAtividade: { nome: string; total: number }[]
  porAno: { ano: string; total: number }[]
  dataMinimaAtividade: string | null
  dataMaximaAtividade: string | null
  anosComDados: string[]
}

export interface AtividadesStatsQuery {
  ano?: number | string
  dataInicio?: string
  dataFim?: string
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

  async function getStats(query?: AtividadesStatsQuery, config?: AxiosRequestConfig): Promise<AtividadesStats> {
    try {
      const params = Object.fromEntries(
        Object.entries({
          ano: query?.ano,
          dataInicio: query?.dataInicio,
          dataFim: query?.dataFim,
        }).filter(([, v]) => v !== undefined && v !== ''),
      )
      const { data } = await api.get<AtividadesStats>('/atividades/stats', { ...config, params })
      return data
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  return { findMany, getStats }
}
