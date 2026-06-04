import type { Metadata, Viewport } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import Script from 'next/script'
import { AuthProvider } from '@/context/auth-context'
import './globals.css'

const APP_NAME = 'Dashboard CTI'
const APP_DEFAULT_TITLE = 'Dashboard CTI — Coordenadoria de Tecnologia da Informação'
const APP_DESCRIPTION = 'Dashboard de monitoramento de atividades, bens, contratos e reuniões da CTI'
const THEME_INITIALIZER = `
(function () {
  try {
    var savedTheme = window.localStorage.getItem('cti_theme');
    var theme = savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();
`

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0c1018' },
  ],
}

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/arpe-mark-64.png', type: 'image/png', sizes: '64x64' },
      { url: '/icons/arpe-mark-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/arpe-mark-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/icons/arpe-mark-64.png',
    apple: [
      { url: '/icons/arpe-mark-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/arpe-mark-512.png', type: 'image/png', sizes: '512x512' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={sourceSans.className} suppressHydrationWarning>
      <body>
        <Script id="theme-initializer" strategy="beforeInteractive">
          {THEME_INITIALIZER}
        </Script>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
