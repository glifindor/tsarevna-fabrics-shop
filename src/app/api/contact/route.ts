import { NextRequest, NextResponse } from 'next/server';

// Telegram Bot API конфигурация
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Валидация данных
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

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

👤 *Имя:* ${name}
📧 *Email:* ${email}
📱 *Телефон:* ${phone}

💬 *Сообщение:*
${message}

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