/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    ACTION_CABLE_URL: process.env.ACTION_CABLE_URL
  }
}

module.exports = nextConfig
