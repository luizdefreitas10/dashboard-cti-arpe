import { api } from '@/services/apiClient'
import { handleAxiosError } from '@/services/error'

export interface PowerBiDashboard {
  id: string
  nome: string
  link: string
  descricao: string | null
  autores: string | null
  status: string
  imagem: string | null
  ordem: number
  createdAt: string
  updatedAt: string
}

export default function PowerBiService() {
  async function list(): Promise<PowerBiDashboard[]> {
    try {
      const { data } = await api.get<{ dashboards: PowerBiDashboard[] }>('/power-bi', {
        params: { _: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      return data.dashboards ?? []
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  return { list }
}
