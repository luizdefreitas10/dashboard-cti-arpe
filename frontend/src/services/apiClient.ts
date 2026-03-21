import axios from 'axios'
import { getApiBaseUrl } from '@/lib/api-config'

export function apiClient() {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  })
  return instance
}

export const api = apiClient()
