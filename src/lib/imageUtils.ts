/**
 * Безопасная обработка URL изображений
 * @param imageUrl - URL изображения (может быть undefined/null)
 * @param fallback - запасное изображение
 * @returns - корректный URL изображения
 */
export function getImageUrl(imageUrl?: string | null, fallback: string = '/vercel.svg'): string {
  // Если изображение не задано или пустое
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return fallback;
  }

  const trimmed = imageUrl.trim();

  // Если это внешний URL (http/https)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Если уже правильный путь /uploads/..., возвращаем как есть
  if (trimmed.startsWith('/uploads/') && trimmed.length > '/uploads/'.length) {
    return trimmed;
  }

  // Если это fallback изображение, возвращаем как есть
  if (trimmed === fallback || trimmed.startsWith('/vercel.') || trimmed.startsWith('/logo.')) {
    return trimmed;
  }

  // Очищаем путь от лишних слешей и префикса uploads/
  const cleanPath = trimmed.replace(/^\/+/, '').replace(/^uploads\//, '');
  
  // Если после очистки ничего не осталось, возвращаем fallback
  if (!cleanPath) {
    return fallback;
  }
  
  // Возвращаем правильный путь
  return `/uploads/${cleanPath}`;
}

/**
 * Получить первое изображение из массива
 * @param images - массив изображений
 * @param fallback - запасное изображение
 * @returns - URL первого изображения или fallback
 */
export function getFirstImage(images?: string[] | null, fallback: string = '/vercel.svg'): string {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallback;
  }

  // Проверяем что первый элемент массива существует и не пустой
  const firstImage = images[0];
  if (!firstImage || typeof firstImage !== 'string' || firstImage.trim() === '') {
    return fallback;
  }

  return getImageUrl(firstImage, fallback);
} 