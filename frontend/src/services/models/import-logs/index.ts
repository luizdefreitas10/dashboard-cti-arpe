import { api } from '@/services/apiClient'
import { handleAxiosError } from '@/services/error'

export interface DataImportLog {
  id: string
  tipo: string
  filename: string | null
  rowsCount: number | null
  message: string | null
  createdAt: string
}

export default function ImportLogsService() {
  async function list(): Promise<DataImportLog[]> {
    try {
      const { data } = await api.get<{ logs: DataImportLog[] }>('/import-logs', {
        params: { _: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      return data.logs ?? []
    } catch (e) {
      throw handleAxiosError(e)
    }
  }

  return { list }
}
