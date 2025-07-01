/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    RPID: process.env.RPID,
    API_HOST: process.env.API_HOST,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
    }

    return config
  },
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  swcMinify: true,
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
}

module.exports = nextConfig
