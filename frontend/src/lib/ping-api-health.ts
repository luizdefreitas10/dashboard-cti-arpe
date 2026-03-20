/**
 * Ajuda a “acordar” a API no Render (plano free hiberna após ~15 min).
 * Use em Server Actions antes de chamadas pesadas ao backend.
 */
const HEALTH_PATH = '/health'
const TIMEOUT_MS = 120_000

export async function pingApiHealth(): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (!base) return
  const url = `${base.replace(/\/$/, '')}${HEALTH_PATH}`
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS)
  try {
    await fetch(url, { method: 'GET', cache: 'no-store', signal: ac.signal })
  } catch {
    // Rede, timeout ou API ainda subindo — o fluxo principal tenta mesmo assim
  } finally {
    clearTimeout(t)
  }
}
