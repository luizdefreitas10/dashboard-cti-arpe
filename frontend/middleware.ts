import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getApiBaseUrl } from '@/lib/api-config'

/**
 * Dispara GET /health na API em paralelo (sem bloquear a página).
 * No Render free, a primeira requisição após hibernação “acorda” o serviço;
 * este ping inicia o processo o mais cedo possível na navegação.
 *
 * Para tempos de resposta consistentes, configure um monitor (ex.: UptimeRobot)
 * pingando /health a cada 10–14 min — ver DEPLOY-RENDER.md.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const shouldPing =
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/tabelas') ||
    pathname === '/power-bi' ||
    pathname === '/solucoes-digitais' ||
    pathname === '/importar'

  if (!shouldPing) return NextResponse.next()

  const base = getApiBaseUrl()
  if (base) {
    const url = `${base}/health`
    fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }).catch(() => {})
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/tabelas/:path*',
    '/power-bi',
    '/solucoes-digitais',
    '/importar',
  ],
}
