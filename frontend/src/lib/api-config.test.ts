import { describe, it, expect } from 'vitest'
import { getApiBaseUrl, isApiUrlConfigured } from './api-config'

describe('api-config', () => {
  it('getApiBaseUrl retorna string não vazia', () => {
    const url = getApiBaseUrl()
    expect(typeof url).toBe('string')
    expect(url.length).toBeGreaterThan(0)
  })

  it('getApiBaseUrl retorna URL válida (http ou https)', () => {
    const url = getApiBaseUrl()
    expect(url).toMatch(/^https?:\/\//)
  })

  it('getApiBaseUrl não termina com barra', () => {
    const url = getApiBaseUrl()
    expect(url).not.toMatch(/\/$/)
  })

  it('isApiUrlConfigured retorna boolean', () => {
    expect(typeof isApiUrlConfigured()).toBe('boolean')
  })
})
