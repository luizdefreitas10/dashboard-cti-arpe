import type { Metadata, Viewport } from 'next'
import { Inter, Montserrat } from 'next/font/google'
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

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600', '700', '800'],
  variable: '--font-montserrat',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f5f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
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
      { url: '/brand/cti-simbolo.svg', type: 'image/svg+xml' },
      { url: '/icons/cti-simbolo-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/cti-simbolo-64.png', type: 'image/png', sizes: '64x64' },
      { url: '/icons/cti-simbolo-192.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/icons/cti-simbolo-64.png',
    apple: [{ url: '/icons/cti-apple-touch-180.png', type: 'image/png', sizes: '180x180' }],
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
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body>
        <Script id="theme-initializer" strategy="beforeInteractive">
          {THEME_INITIALIZER}
        </Script>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
