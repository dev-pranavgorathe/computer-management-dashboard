/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*.vercel.app', 'localhost:3000'],
    },
  },
}

module.exports = nextConfig
