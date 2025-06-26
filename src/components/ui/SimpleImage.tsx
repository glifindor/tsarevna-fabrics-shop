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
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && currentSrc !== fallback) {
      console.log('Ошибка загрузки изображения:', currentSrc, '-> переключение на:', fallback);
      setHasError(true);
      setCurrentSrc(fallback);
    }
  };

  const handleLoad = () => {
    // Успешная загрузка
    if (hasError && currentSrc === fallback) {
      setHasError(false);
    }
  };

  // Простая обработка URL изображений
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

  return (
    <img
      src={getImageSrc(currentSrc)}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
    />
  );
} 