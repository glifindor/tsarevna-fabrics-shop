// Глобальный обработчик ошибок для браузера
export function initErrorHandler() {
  // Только для клиентской части
  if (typeof window === 'undefined') return;

  // Только в production режиме скрываем ошибки
  if (process.env.NODE_ENV !== 'production') return;

  // Перехватываем console.error
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    
    // Фильтруем сетевые ошибки
    if (
      message.includes('Failed to load resource') ||
      message.includes('ERR_BLOCKED_BY_CLIENT') ||
      message.includes('ERR_NETWORK') ||
      message.includes('fetch') ||
      message.includes('NetworkError') ||
      message.includes('AdBlock')
    ) {
      // Не показываем в консоли
      return;
    }
    
    // Для остальных ошибок вызываем оригинальный console.error
    originalError.apply(console, args);
  };

  // Перехватываем console.warn для предупреждений о изображениях
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    
    // Фильтруем предупреждения о изображениях
    if (
      message.includes('Image with src') ||
      message.includes('failed to load') ||
      message.includes('404')
    ) {
      // Не показываем в консоли
      return;
    }
    
    // Для остальных предупреждений вызываем оригинальный console.warn
    originalWarn.apply(console, args);
  };

  // Перехватываем глобальные ошибки
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    
    // Фильтруем сетевые ошибки
    if (
      message.includes('Failed to load resource') ||
      message.includes('ERR_BLOCKED_BY_CLIENT') ||
      message.includes('ERR_NETWORK') ||
      event.filename?.includes('chrome-extension') ||
      event.filename?.includes('moz-extension')
    ) {
      // Предотвращаем показ ошибки в консоли
      event.preventDefault();
      return false;
    }
  });

  // Перехватываем необработанные Promise rejection'ы
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    
    // Фильтруем сетевые ошибки
    if (
      reason.includes('Failed to fetch') ||
      reason.includes('ERR_BLOCKED_BY_CLIENT') ||
      reason.includes('ERR_NETWORK') ||
      reason.includes('NetworkError')
    ) {
      // Предотвращаем показ ошибки в консоли
      event.preventDefault();
      return false;
    }
  });
} 