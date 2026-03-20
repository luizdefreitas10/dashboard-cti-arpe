'use server'

import { handleAxiosError } from '@/services/error'
import { pingApiHealth } from '@/lib/ping-api-health'
import AtividadesService from '@/services/models/atividades'

export async function getAtividadesStats() {
  try {
    void pingApiHealth()
    const { getStats } = AtividadesService()
    const stats = await getStats()
    return { isError: false, stats }
  } catch (error) {
    const e = handleAxiosError(error)
    return { isError: true, error: e.message, stats: null }
  }
}
