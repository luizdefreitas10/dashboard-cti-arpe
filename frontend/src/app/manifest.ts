import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Dashboard CTI — Coordenadoria de Tecnologia da Informação',
    short_name: 'Dashboard CTI',
    description: 'Dashboard de monitoramento de atividades, bens, contratos e reuniões da CTI.',
    lang: 'pt-BR',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f172a',
    theme_color: '#0b2160',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icons/cti-simbolo-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/cti-simbolo-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/cti-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
