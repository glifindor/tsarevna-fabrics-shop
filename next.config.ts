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
  
  // Настройка заголовков для статических файлов
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60', // Кэш только на 1 минуту для быстрого обновления
          },
          {
            key: 'X-Accel-Expires',
            value: '60',
          },
        ],
      },
      // Security Headers
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.telegram.org;",
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
