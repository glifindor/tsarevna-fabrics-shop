'use client';
import { useState } from 'react';
import { logger } from '@/lib/logger';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export default function ProductImage({
  src,
  alt,
  className = '',
  style,
  width,
  height,
  onClick,
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    logger.log(`Ошибка загрузки изображения (попытка ${errorCount + 1}):`, currentSrc);
    
    if (errorCount === 0) {
      // Первая ошибка - пробуем API route
      const apiUrl = getApiImageSrc(currentSrc);
      logger.log('Пробуем API route:', apiUrl);
      setErrorCount(1);
      setCurrentSrc(apiUrl);
      setHasError(false);
      setIsLoading(true);
    } else if (errorCount === 1) {
      // Вторая ошибка - пробуем другой API route
      const uploadsApiUrl = getUploadsApiSrc(currentSrc);
      logger.log('Пробуем uploads API route:', uploadsApiUrl);
      setErrorCount(2);
      setCurrentSrc(uploadsApiUrl);
      setHasError(false);
      setIsLoading(true);
    } else if (errorCount === 2 && currentSrc !== getNoImageFallback()) {
      // Третья ошибка - используем fallback
      logger.log('API routes не сработали, используем fallback:', getNoImageFallback());
      setErrorCount(3);
      setCurrentSrc(getNoImageFallback());
    }
  };

  // Создаем fallback изображение
  const getNoImageFallback = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Cg transform='translate(150,150)'%3E%3Ccircle r='40' fill='%23d1d5db'/%3E%3Cpath d='M-20,-10 L-10,-20 L10,-20 L20,-10 L20,10 L10,20 L-10,20 L-20,10 Z' fill='%23fff'/%3E%3Ccircle cx='0' cy='-5' r='8' fill='%23d1d5db'/%3E%3Cpath d='M-15,5 Q-10,15 -5,5 Q0,15 5,5 Q10,15 15,5' stroke='%23d1d5db' stroke-width='2' fill='none'/%3E%3C/g%3E%3Ctext x='150' y='250' text-anchor='middle' font-family='Arial' font-size='14' fill='%23666'%3EИзображение не найдено%3C/text%3E%3C/svg%3E";
  };

  // API route URL для файлов uploads через /api/static
  const getApiImageSrc = (imageUrl: string) => {
    if (!imageUrl) return getNoImageFallback();
    
    // Если это внешний URL или локальный файл, возвращаем как есть
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/vercel.') || imageUrl.startsWith('/logo.')) {
      return imageUrl;
    }
    
    // Очищаем путь от /uploads/ в начале
    const cleanPath = imageUrl.replace(/^\/?(uploads\/)?/, '');
    
    // Возвращаем URL через API route
    return `/api/static/${cleanPath}`;
  };

  // API route URL для файлов uploads через /api/uploads
  const getUploadsApiSrc = (imageUrl: string) => {
    if (!imageUrl) return getNoImageFallback();
    
    // Если это внешний URL или локальный файл, возвращаем как есть
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/vercel.') || imageUrl.startsWith('/logo.')) {
      return imageUrl;
    }
    
    // Очищаем путь от /uploads/ в начале
    const cleanPath = imageUrl.replace(/^\/?(uploads\/)?/, '');
    
    // Возвращаем URL через API route
    return `/api/uploads/${cleanPath}`;
  };

  // Форматируем src для правильного отображения
  const formatSrc = (imageSrc: string) => {
    if (!imageSrc || imageSrc === 'undefined' || imageSrc === 'null') {
      return getNoImageFallback();
    }

    // Если это data URL, возвращаем как есть
    if (imageSrc.startsWith('data:')) {
      return imageSrc;
    }

    // Если это внешний URL, возвращаем как есть
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      return imageSrc;
    }
    
    // Если это уже правильный путь /uploads/, возвращаем как есть
    if (imageSrc.startsWith('/uploads/')) {
      return imageSrc;
    }
    
    // Если это локальный файл (logo, vercel и т.д.)
    if (imageSrc.startsWith('/')) {
      return imageSrc;
    }
    
    // Иначе добавляем /uploads/
    return `/uploads/${imageSrc}`;
  };

  return (
    <div className={`relative ${className}`} style={style} onClick={onClick}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Загрузка...</div>
        </div>
      )}
      
      <img
        src={errorCount === 0 ? formatSrc(currentSrc) : currentSrc}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
} 