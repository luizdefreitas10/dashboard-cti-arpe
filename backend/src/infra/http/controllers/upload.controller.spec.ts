import { normalizeContratoStatus } from './upload.controller'

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
