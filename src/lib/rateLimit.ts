// Простая система rate limiting на основе IP
const rateLimit = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  max: number; // Максимальное количество запросов
  windowMs: number; // Временное окно в миллисекундах
}

export function createRateLimit(options: RateLimitOptions) {
  return {
    check: (identifier: string): { success: boolean; remaining: number; resetTime: number } => {
      const now = Date.now();
      const record = rateLimit.get(identifier);

      // Если записи нет или окно истекло, создаем новую
      if (!record || now > record.resetTime) {
        const newRecord = {
          count: 1,
          resetTime: now + options.windowMs,
        };
        rateLimit.set(identifier, newRecord);
        return {
          success: true,
          remaining: options.max - 1,
          resetTime: newRecord.resetTime,
        };
      }

      // Проверяем лимит
      if (record.count >= options.max) {
        return {
          success: false,
          remaining: 0,
          resetTime: record.resetTime,
        };
      }

      // Увеличиваем счетчик
      record.count++;
      rateLimit.set(identifier, record);

      return {
        success: true,
        remaining: options.max - record.count,
        resetTime: record.resetTime,
      };
    },
  };
}

// Предустановленные лимиты
export const loginRateLimit = createRateLimit({
  max: 5, // 5 попыток входа
  windowMs: 15 * 60 * 1000, // за 15 минут
});

export const registerRateLimit = createRateLimit({
  max: 3, // 3 регистрации
  windowMs: 60 * 60 * 1000, // за час
});

export const contactRateLimit = createRateLimit({
  max: 3, // 3 сообщения
  windowMs: 60 * 60 * 1000, // за час
});

export const apiRateLimit = createRateLimit({
  max: 100, // 100 запросов к API
  windowMs: 60 * 1000, // за минуту
});

// Очистка старых записей каждые 30 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimit.entries()) {
    if (now > record.resetTime) {
      rateLimit.delete(key);
    }
  }
}, 30 * 60 * 1000); 