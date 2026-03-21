import { describe, it, expect } from 'vitest'
import { formatNumber, formatDate, formatMonth } from './utils'

describe('formatNumber', () => {
  it('formata número inteiro em pt-BR', () => {
    expect(formatNumber(1000)).toBe('1.000')
  })

  it('formata número grande', () => {
    expect(formatNumber(1234567)).toBe('1.234.567')
  })

  it('formata zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('formatDate', () => {
  it('formata data ISO string', () => {
    expect(formatDate('2024-03-15')).toMatch(/\d{2}\/\d{2}\/2024/)
  })

  it('retorna em dash para null/undefined', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
  })

  it('retorna em dash para data inválida', () => {
    expect(formatDate('invalid')).toBe('—')
  })
})

describe('formatMonth', () => {
  it('formata mês no formato ano-mes', () => {
    const result = formatMonth('2024-03')
    expect(result).toMatch(/mar|mar\./i)
    expect(result).toMatch(/24/)
  })
})
