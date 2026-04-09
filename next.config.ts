import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // xAI / Aurora image generation CDN
      {
        protocol: 'https',
        hostname: '*.x.ai',
      },
      {
        protocol: 'https',
        hostname: 'imgen.x.ai',
      },
    ],
  },
}

export default nextConfig
