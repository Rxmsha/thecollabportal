/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'xano.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
