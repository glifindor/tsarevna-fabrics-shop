import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Отключаем оптимизацию изображений для простоты
    unoptimized: true,
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
    // Простая настройка без сложной оптимизации
    minimumCacheTTL: 60,
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

  // Настройка для статических файлов
  trailingSlash: false,
  
  // Отключение оптимизации изображений для uploads (временно)
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "212.69.87.22:3000"]
    }
  }
};

export default nextConfig;
