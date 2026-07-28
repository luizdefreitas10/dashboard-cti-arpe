import { normalizeContratoStatus, parseContratosWorkbook } from './upload.controller'
import * as XLSX from 'xlsx'

describe('normalizeContratoStatus', () => {
  it('keeps blank monthly contract status as due instead of expired', () => {
    expect(normalizeContratoStatus(null)).toBe('A_VENCER')
    expect(normalizeContratoStatus('')).toBe('A_VENCER')
    expect(normalizeContratoStatus('   ')).toBe('A_VENCER')
  })

  it('uses explicit spreadsheet statuses when present', () => {
    expect(normalizeContratoStatus('Pago')).toBe('PAGO')
    expect(normalizeContratoStatus('Vencido')).toBe('VENCIDO')
    expect(normalizeContratoStatus('A vencer')).toBe('A_VENCER')
  })
})

describe('parseContratosWorkbook', () => {
  function buildSingleProviderSheet(prestador: string): XLSX.WorkSheet {
    const rows: unknown[][] = Array.from({ length: 20 }, () => Array(9).fill(null))
    rows[2][1] = prestador
    rows[4][1] = 'Ano'
    rows[4][2] = 'Mês'
    rows[4][3] = 'Pagamento'
    rows[4][4] = 'Status'
    rows[4][5] = 'N° Processo'
    rows[5][1] = 2026
    rows[5][2] = 'Janeiro'
    rows[5][3] = '100'
    rows[5][4] = 'Pago'
    rows[5][5] = `PROC-${prestador}`
    return XLSX.utils.aoa_to_sheet(rows)
  }

  it('imports MÉTODO, VECTRA and 1TELECOM tabs alongside legacy providers', () => {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, buildSingleProviderSheet('MÉTODO'), 'MÉTODO')
    XLSX.utils.book_append_sheet(wb, buildSingleProviderSheet('VECTRA'), 'VECTRA')
    XLSX.utils.book_append_sheet(wb, buildSingleProviderSheet('1TELECOM'), '1TELECOM')

    const parsed = parseContratosWorkbook(wb)
    const prestadores = parsed.map((item) => item.prestador).sort()

    expect(prestadores).toEqual(['1TELECOM', 'MÉTODO', 'VECTRA'])
    expect(parsed.every((item) => item.pagamentos.length >= 1)).toBe(true)
    expect(parsed.find((item) => item.prestador === 'MÉTODO')?.numeroReferencia).toBe('PROC-MÉTODO')
  })
})
