'use client';
import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  fallback?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function SafeImage({
  src,
  alt,
  fallback = '/vercel.svg',
  fill,
  className,
  sizes,
  width,
  height,
  priority,
}: SafeImageProps) {
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
    // Сбрасываем состояние ошибки при успешной загрузке
    if (hasError && currentSrc === fallback) {
      setHasError(false);
    }
  };

  // Если это Next.js Image component
  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  // Если заданы width и height
  if (width && height) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
      />
    );
  }

  // Fallback для обычных изображений
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
} 