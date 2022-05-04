/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/graphql',
        destination: 'http://localhost:3000/graphql' // Proxy to Backend
      }
    ]
  }
}

module.exports = nextConfig
