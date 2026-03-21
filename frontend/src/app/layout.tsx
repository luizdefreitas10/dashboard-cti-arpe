import type { Metadata, Viewport } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import './globals.css'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Dashboard CTI — Coordenadoria de Tecnologia da Informação',
  description: 'Dashboard de monitoramento de atividades e bens da CTI',
  icons: {
    icon: [{ url: '/arpe-favicon.png', type: 'image/png', sizes: '64x64' }],
    shortcut: '/arpe-favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={sourceSans.className}>
      <body>{children}</body>
    </html>
  )
}
