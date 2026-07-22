import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicRuntimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? "",
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? process.env.CLOUDINARY_UPLOAD_PRESET ?? "",
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: publicRuntimeEnv,
  reactStrictMode: true,
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 31536000,
  },
  async redirects() {
    return [
      { source: '/Home', destination: '/', permanent: true },
      { source: '/AboutPage', destination: '/about', permanent: true },
      { source: '/MissionPage', destination: '/mission', permanent: true },
      { source: '/CampusPage', destination: '/campus', permanent: true },
      { source: '/AcademicsPage', destination: '/academics', permanent: true },
      { source: '/AdmissionPage', destination: '/admission', permanent: true },
      { source: '/AdmissionForm', destination: '/admission-form', permanent: true },
      { source: '/AdmissionChoicePage', destination: '/admission-choice', permanent: true },
      { source: '/GalleryPage', destination: '/gallery', permanent: true },
      { source: '/VideoGalleryPage', destination: '/video-gallery', permanent: true },
      { source: '/BranchGalleryPage', destination: '/branch-gallery', permanent: true },
      { source: '/TeachersPage', destination: '/teachers', permanent: true },
      { source: '/ResultsPage', destination: '/results', permanent: true },
      { source: '/AllNoticesPage', destination: '/notices', permanent: true },
    ];
  },

  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|webp|avif|ico|svg)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(js|css)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      '@/pages.config': './pages.config.js',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      '@/pages.config': path.resolve(__dirname, './pages.config.js'),
      ...config.resolve.alias,
    };
    return config;
  },
}

export default nextConfig
