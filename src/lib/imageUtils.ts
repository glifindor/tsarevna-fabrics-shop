/**
 * Безопасная обработка URL изображений
 * @param imageUrl - URL изображения (может быть undefined/null)
 * @param fallback - запасное изображение
 * @returns - корректный URL изображения
 */
export function getImageUrl(imageUrl?: string | null, fallback: string = '/logo.jpg'): string {
  // Если изображение не задано или пустое
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return fallback;
  }

  // Если это внешний URL (http/https)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Очищаем путь от лишних слешей и добавляем /uploads/ если нужно
  const cleanPath = imageUrl.replace(/^\/+/, '').replace(/^uploads\//, '');
  
  // Возвращаем правильный путь
  return `/uploads/${cleanPath}`;
}

/**
 * Получить первое изображение из массива
 * @param images - массив изображений
 * @param fallback - запасное изображение
 * @returns - URL первого изображения или fallback
 */
export function getFirstImage(images?: string[] | null, fallback: string = '/logo.jpg'): string {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallback;
  }

  return getImageUrl(images[0], fallback);
} 