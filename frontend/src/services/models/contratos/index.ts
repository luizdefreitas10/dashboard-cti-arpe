import { api } from '@/services/apiClient'
import { handleAxiosError } from '@/services/error'

export type ContratoStatus = 'PAGO' | 'A_VENCER' | 'VENCIDO' | 'SEM_STATUS'

export interface ContratoPagamento {
  id: string
  ano: number
  mes: number
  pagamento: string | null
  status: ContratoStatus
}

export interface ContratoServico {
  id: string
  prestador: string
  nomeServico: string
  numeroReferencia: string | null
  dataInicio: string | null
  dataFinal: string | null
  observacoes: string | null
  pagamentos: ContratoPagamento[]
}

export interface ContratosResumo {
  totalServicos: number
  totalCompetencias: number
  byStatus: Record<ContratoStatus, number>
  byPrestador: Record<
    string,
    {
      servicos: number
      competencias: number
      PAGO: number
      A_VENCER: number
      VENCIDO: number
      SEM_STATUS: number
    }
  >
}

export default function ContratosService() {
  async function list(filters?: {
    prestador?: string
    servico?: string
    ano?: number
    status?: ContratoStatus | 'TODOS'
  }): Promise<ContratoServico[]> {
    try {
      const params: Record<string, string | number> = { _: Date.now() }
      if (filters?.prestador && filters.prestador !== 'TODOS') params.prestador = filters.prestador
      if (filters?.servico) params.servico = filters.servico
      if (filters?.ano) params.ano = filters.ano
      if (filters?.status && filters.status !== 'TODOS') params.status = filters.status

      const { data } = await api.get<{ servicos: ContratoServico[] }>('/contratos', {
        params,
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      return data.servicos ?? []
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  async function resumo(filters?: { ano?: number; prestador?: string }): Promise<ContratosResumo> {
    try {
      const params: Record<string, string | number> = { _: Date.now() }
      if (filters?.ano) params.ano = filters.ano
      if (filters?.prestador && filters.prestador !== 'TODOS') params.prestador = filters.prestador

      const { data } = await api.get<ContratosResumo>('/contratos/resumo', {
        params,
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      return data
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  return { list, resumo }
}
