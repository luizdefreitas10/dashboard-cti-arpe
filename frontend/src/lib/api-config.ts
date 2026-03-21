/**
 * Configuração centralizada da API.
 * Use getApiBaseUrl() em toda a aplicação para garantir URL consistente.
 */

const RAW = (process.env.NEXT_PUBLIC_API_URL ?? '').trim()
const DEFAULT = 'http://localhost:3333'

/** URL base da API, sem barra final. Fallback para localhost em dev. */
export function getApiBaseUrl(): string {
  if (RAW.length > 0) return RAW.replace(/\/+$/, '')
  return DEFAULT
}

/** Indica se a URL foi definida explicitamente via variável de ambiente. */
export function isApiUrlConfigured(): boolean {
  return RAW.length > 0
}
