import { NextRequest, NextResponse } from 'next/server';
import { contactRateLimit } from '@/lib/rateLimit';
import { validateUserInput } from '@/lib/sanitize';

// Telegram Bot API конфигурация
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting по IP адресу
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = contactRateLimit.check(ip);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Слишком много запросов. Попробуйте позже.',
          resetTime: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Базовая проверка наличия полей
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Валидация и санитизация данных
    const nameValidation = validateUserInput(name, 'text');
    const emailValidation = validateUserInput(email, 'email');
    const phoneValidation = validateUserInput(phone, 'phone');
    const messageValidation = validateUserInput(message, 'message');

    const allErrors = [
      ...nameValidation.errors,
      ...emailValidation.errors,
      ...phoneValidation.errors,
      ...messageValidation.errors
    ];

    if (allErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ошибка валидации данных',
          errors: allErrors 
        },
        { status: 400 }
      );
    }

    // Используем санитизированные данные
    const sanitizedData = {
      name: nameValidation.sanitized,
      email: emailValidation.sanitized,
      phone: phoneValidation.sanitized,
      message: messageValidation.sanitized
    };

    // Проверяем наличие Telegram конфигурации
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram configuration missing');
      return NextResponse.json(
        { success: false, message: 'Конфигурация Telegram не настроена' },
        { status: 500 }
      );
    }

    // Формируем сообщение для Telegram
    const telegramMessage = `
🌐 *НОВОЕ СООБЩЕНИЕ С САЙТА*
📧 *Форма: Связаться с нами*

👤 *Имя:* ${sanitizedData.name}
📧 *Email:* ${sanitizedData.email}
📱 *Телефон:* ${sanitizedData.phone}

💬 *Сообщение:*
${sanitizedData.message}

⏰ *Время:* ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
🔗 *Источник:* Сайт Царевна Швеяна
    `.trim();

    // Отправляем в Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }),
    });

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      console.error('Telegram API error:', errorData);
      throw new Error('Failed to send to Telegram');
    }

    console.log('Contact form message sent to Telegram successfully');

    return NextResponse.json({
      success: true,
      message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.'
    });

  } catch (error) {
    console.error('Error sending contact form:', error);
    return NextResponse.json(
      { success: false, message: 'Произошла ошибка при отправке сообщения' },
      { status: 500 }
    );
  }
} 