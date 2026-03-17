import axios, { AxiosError } from 'axios'

export interface CustomError {
  message: string
  statusCode?: number
}

export function handleAxiosError(error: unknown): CustomError {
  if (axios.isAxiosError(error)) {
    const e = error as AxiosError<{ message?: string }>
    const message =
      e.response?.data?.message ?? 'Ocorreu um erro inesperado'
    return { message, statusCode: e.response?.status }
  }
  return { message: (error as Error).message ?? 'Erro desconhecido' }
}
