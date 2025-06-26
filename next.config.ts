import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '212.69.87.22',
        pathname: '/**',
      },
    ],
    // Разрешаем все локальные пути для изображений
    unoptimized: false,
  },
  
  // Настройка статических файлов
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ];
  },
  
  // Настройка заголовков для кеширования
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'image/*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
