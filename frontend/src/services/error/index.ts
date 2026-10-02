import axios, { AxiosError } from 'axios'

export interface CustomError {
  message: string
  statusCode?: number
}

function normalizeApiMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined
  const data = payload as {
    message?: string | string[]
    errors?: Record<string, string[] | undefined>
  }

  if (data.errors) {
    const fromFields = Object.values(data.errors).flat().find(Boolean)
    if (typeof fromFields === 'string') return fromFields
  }

  if (Array.isArray(data.message)) {
    const first = data.message.find((item) => typeof item === 'string')
    if (typeof first === 'string') return first
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  return undefined
}

export function handleAxiosError(error: unknown): CustomError {
  if (axios.isAxiosError(error)) {
    const e = error as AxiosError<{ message?: string | string[]; errors?: Record<string, string[]> }>
    const message =
      normalizeApiMessage(e.response?.data) ?? 'Ocorreu um erro inesperado'
    return { message, statusCode: e.response?.status }
  }
  return { message: (error as Error).message ?? 'Erro desconhecido' }
}
