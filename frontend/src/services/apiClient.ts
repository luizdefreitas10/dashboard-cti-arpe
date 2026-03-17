import axios from 'axios'

export function apiClient() {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  })
  return instance
}

export const api = apiClient()
