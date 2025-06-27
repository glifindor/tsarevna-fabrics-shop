// Утилиты для санитизации и валидации пользовательских данных

/**
 * Санитизация строки от потенциально опасных символов
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Удаляем < и >
    .replace(/javascript:/gi, '') // Удаляем javascript: схемы
    .replace(/on\w+=/gi, '') // Удаляем onclick= и подобные
    .substring(0, 1000); // Ограничиваем длину
}

/**
 * Санитизация HTML контента
 */
export function sanitizeHtml(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Удаляем script теги
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Удаляем iframe теги
    .replace(/<object[^>]*>.*?<\/object>/gi, '') // Удаляем object теги
    .replace(/<embed[^>]*>/gi, '') // Удаляем embed теги
    .replace(/javascript:/gi, '') // Удаляем javascript: схемы
    .replace(/on\w+\s*=/gi, '') // Удаляем event handlers
    .trim()
    .substring(0, 5000); // Ограничиваем длину
}

/**
 * Валидация email адреса
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Валидация номера телефона (российские номера)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(phone) && cleanPhone.length >= 10 && cleanPhone.length <= 12;
}

/**
 * Нормализация номера телефона
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  
  // Удаляем все нецифровые символы кроме +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Если начинается с 8, заменяем на +7
  if (cleaned.startsWith('8')) {
    cleaned = '+7' + cleaned.substring(1);
  }
  
  // Если начинается с 7 без +, добавляем +
  if (cleaned.startsWith('7') && !cleaned.startsWith('+7')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Проверка на SQL инъекции (базовая)
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(--|\*\/|\/\*)/g,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /('|(\\)?('|"|`))(''|""|``)*[^\w\s]/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Проверка на XSS паттерны
 */
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*=/gi,
    /expression\s*\(/gi,
    /vbscript:/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Комплексная валидация пользовательского ввода
 */
export function validateUserInput(input: string, type: 'text' | 'email' | 'phone' | 'message' = 'text'): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitized = sanitizeString(input);
  
  // Проверка на безопасность
  if (containsSqlInjection(input)) {
    errors.push('Обнаружена попытка SQL инъекции');
  }
  
  if (containsXss(input)) {
    errors.push('Обнаружена попытка XSS атаки');
  }
  
  // Специфичная валидация по типу
  switch (type) {
    case 'email':
      if (!isValidEmail(sanitized)) {
        errors.push('Некорректный формат email');
      }
      break;
      
    case 'phone':
      if (!isValidPhone(sanitized)) {
        errors.push('Некорректный формат номера телефона');
      } else {
        sanitized = normalizePhone(sanitized);
      }
      break;
      
    case 'message':
      sanitized = sanitizeHtml(input);
      if (sanitized.length < 10) {
        errors.push('Сообщение слишком короткое (минимум 10 символов)');
      }
      break;
      
    case 'text':
    default:
      if (sanitized.length < 2) {
        errors.push('Текст слишком короткий (минимум 2 символа)');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
} 