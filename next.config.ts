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
            value: 'public, max-age=3600', // Кэш на 1 час
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
