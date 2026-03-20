'use server'

import { handleAxiosError } from '@/services/error'
import { pingApiHealth } from '@/lib/ping-api-health'
import BensService from '@/services/models/bens'

export async function getBensStats() {
  try {
    void pingApiHealth()
    const { getStats, getRamais } = BensService()
    const [stats, ramaisResp] = await Promise.all([getStats(), getRamais()])
    return { isError: false, stats, ramais: ramaisResp.ramais }
  } catch (error) {
    const e = handleAxiosError(error)
    return { isError: true, error: e.message, stats: null, ramais: [] }
  }
}
