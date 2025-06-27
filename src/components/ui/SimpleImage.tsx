'use client';
import { useState } from 'react';

interface SimpleImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export default function SimpleImage({
  src,
  alt,
  fallback = '/vercel.svg',
  className,
  style,
  width,
  height,
  onClick,
}: SimpleImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    console.log(`Ошибка загрузки изображения (попытка ${errorCount + 1}):`, currentSrc);
    
    if (errorCount === 0) {
      // Первая ошибка - пробуем API route
      const apiUrl = getApiImageSrc(src);
      console.log('Пробуем API route:', apiUrl);
      setErrorCount(1);
      setCurrentSrc(apiUrl);
    } else if (errorCount === 1 && currentSrc !== fallback) {
      // Вторая ошибка - используем fallback
      console.log('API route не сработал, используем fallback:', fallback);
      setErrorCount(2);
      setCurrentSrc(fallback);
    }
  };

  // Простая обработка URL изображений для статических файлов
  const getImageSrc = (imageUrl: string) => {
    if (!imageUrl) return fallback;
    
    // Если это внешний URL, возвращаем как есть
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Если это уже правильный путь /uploads/, возвращаем как есть
    if (imageUrl.startsWith('/uploads/')) {
      return imageUrl;
    }
    
    // Если это путь к локальному файлу (logo, vercel и т.д.)
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // Иначе добавляем /uploads/
    return `/uploads/${imageUrl}`;
  };

  // API route URL для файлов uploads
  const getApiImageSrc = (imageUrl: string) => {
    if (!imageUrl) return fallback;
    
    // Если это внешний URL или локальный файл, возвращаем как есть
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/vercel.') || imageUrl.startsWith('/logo.')) {
      return imageUrl;
    }
    
    // Очищаем путь от /uploads/ в начале
    const cleanPath = imageUrl.replace(/^\/?(uploads\/)?/, '');
    
    // Возвращаем URL через API route
    return `/api/static/${cleanPath}`;
  };

  return (
    <img
      src={getImageSrc(currentSrc)}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={handleError}
      onClick={onClick}
    />
  );
} 