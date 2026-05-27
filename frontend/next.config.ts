import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  cacheStartUrl: true,
  dynamicStartUrl: true,
  reloadOnOnline: true,
  fallbacks: {
    document: '/~offline',
  },
  publicExcludes: [
    '!contratos/providers/**/*',
    '!power-bi/**/*',
    '!solucoes-digitais/**/*',
    '!*.svg',
  ],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
}

export default withPWA(nextConfig)
