import { api } from '@/services/apiClient'
import { handleAxiosError } from '@/services/error'

export interface Bem {
  id: string
  tombamento: string
  tipoHardware?: string | null
  modelo?: string | null
  usuario?: string | null
  setor?: string | null
  finalidadePrincipal?: string | null
  sistemaOperacional?: string | null
  criticidade?: string | null
}

export interface BensResponse {
  bens: Bem[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface BemFilters {
  page?: number
  size?: number
  tipoHardware?: string
  setor?: string
  modelo?: string
  sistemaOperacional?: string
  busca?: string
  /** Contém (texto) no campo criticidade */
  criticidade?: string
  /** true = apenas bens com criticidade preenchida (igual ao KPI da visão geral) */
  comCriticidade?: boolean
}

export interface BensStats {
  totalBens: number
  totalSoftwares: number
  totalRamais: number
  totalCelulares: number
  bensComCriticidadeRegistrada: number
  porTipo: { tipo: string; total: number }[]
  porSetor: { setor: string; total: number }[]
  porModelo: { modelo: string; total: number }[]
  porSO: { so: string; total: number }[]
}

export interface Software {
  id: string
  nome: string
  versao?: string | null
  finalidade?: string | null
}

export interface Ramal {
  id: string
  setor: string
  digital: number
  analogico: number
  total: number
  descricao?: string | null
}

export interface Celular {
  id: string
  modelo: string
  setor: string
  imei: string
}

export default function BensService() {
  async function findMany(filters: BemFilters = {}): Promise<BensResponse> {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => {
          if (v === undefined || v === '') return false
          if (v === false) return false
          return true
        }),
      )
      const { data } = await api.get<BensResponse>('/bens', { params })
      return data
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  async function getStats(): Promise<BensStats> {
    try {
      const { data } = await api.get<BensStats>('/bens/stats')
      return data
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  async function getSoftwares(): Promise<{ softwares: Software[]; total: number }> {
    try {
      const { data } = await api.get('/bens/softwares')
      return data
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  async function getRamais(): Promise<{ ramais: Ramal[]; total: number }> {
    try {
      const { data } = await api.get('/bens/ramais')
      return data
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  async function getCelulares(): Promise<{ celulares: Celular[]; total: number }> {
    try {
      const { data } = await api.get('/bens/celulares')
      return data
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  return { findMany, getStats, getSoftwares, getRamais, getCelulares }
}
