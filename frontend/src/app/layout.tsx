import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
