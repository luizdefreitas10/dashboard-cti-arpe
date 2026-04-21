'use server'

import { handleAxiosError } from '@/services/error'
import { pingApiHealth } from '@/lib/ping-api-health'
import AtividadesService from '@/services/models/atividades'
import BensService from '@/services/models/bens'
import SolucoesDigitaisService from '@/services/models/solucoes-digitais'
import PowerBiService from '@/services/models/power-bi'
import ImportLogsService from '@/services/models/import-logs'
import type { DataImportLog } from '@/services/models/import-logs'
import ContratosService from '@/services/models/contratos'
import type { ContratosResumo } from '@/services/models/contratos'

/** Dados agregados para a visão executiva (página inicial /dashboard). */
export async function getExecutiveOverview() {
  try {
    void pingApiHealth()
    const atividades = AtividadesService()
    const bens = BensService()
    const solucoes = SolucoesDigitaisService()
    const powerBi = PowerBiService()
    const importLogs = ImportLogsService()

    const [statsAtividades, statsBens, listaSolucoes, dashboards, logs, contratosResumo] = await Promise.all([
      atividades.getStats(),
      bens.getStats(),
      solucoes.list(),
      powerBi.list().catch(() => []),
      importLogs.list().catch(() => []),
      ContratosService().resumo({}).catch(() => null as ContratosResumo | null),
    ])

    const solucoesConcluidas = listaSolucoes.filter((s) => s.statusProjeto === 'concluida').length
    const solucoesEmAndamento = listaSolucoes.filter((s) => s.statusProjeto === 'em_andamento').length
    const powerBiConcluidos = dashboards.filter((d) => d.status === 'concluido').length

    const win11 =
      statsBens.porSO?.find((r) => String(r.so).toLowerCase().includes('windows 11'))?.total ?? 0
    const win10 =
      statsBens.porSO?.find(
        (r) =>
          String(r.so).toLowerCase().includes('windows 10') &&
          !String(r.so).toLowerCase().includes('windows 11'),
      )?.total ?? 0
    const soComVersao = win11 + win10
    const pctWin11 = soComVersao > 0 ? Math.round((win11 / soComVersao) * 100) : null

    return {
      isError: false as const,
      statsAtividades,
      statsBens,
      solucoesTotal: listaSolucoes.length,
      solucoesConcluidas,
      solucoesEmAndamento,
      powerBiTotal: dashboards.length,
      powerBiConcluidos,
      pctWin11,
      importLogs: logs.slice(0, 12),
      contratosResumo,
    }
  } catch (error) {
    const e = handleAxiosError(error)
    return {
      isError: true as const,
      error: e.message,
      statsAtividades: null,
      statsBens: null,
      solucoesTotal: 0,
      solucoesConcluidas: 0,
      solucoesEmAndamento: 0,
      powerBiTotal: 0,
      powerBiConcluidos: 0,
      pctWin11: null as number | null,
      importLogs: [] as DataImportLog[],
      contratosResumo: null as ContratosResumo | null,
    }
  }
}
