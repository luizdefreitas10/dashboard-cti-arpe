import { api } from '@/services/apiClient'
import { handleAxiosError } from '@/services/error'

export interface SolucaoDigital {
  id: string
  tipo: string
  nome: string
  descricao: string | null
  setor: string | null
  stack: string | null
  urlRepositorio: string | null
  imagem: string | null
  responsavel: string | null
  dataInicio: string | null
  observacoes: string | null
  statusProjeto: string
  urlProducao: string | null
  ordem: number
  createdAt: string
  updatedAt: string
}

export default function SolucoesDigitaisService() {
  async function list(): Promise<SolucaoDigital[]> {
    try {
      const { data } = await api.get<{ solucoes: SolucaoDigital[] }>('/solucoes-digitais', {
        params: { _: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      return data.solucoes ?? []
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  return { list }
}
