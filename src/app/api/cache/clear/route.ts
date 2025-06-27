import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    // Проверка авторизации - только админы могут очищать кеш
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Требуются права администратора' },
        { status: 403 }
      );
    }

    console.log('POST /api/cache/clear: Запрос на очистку кеша от админа:', session.user.email);

    // Попытка принудительной очистки кеша Next.js
    // Это может не работать в production, но поможет в development
    if (process.env.NODE_ENV === 'development') {
      try {
        // Очистка require cache для модулей
        Object.keys(require.cache).forEach((key) => {
          if (key.includes('uploads') || key.includes('static')) {
            delete require.cache[key];
          }
        });
        
        console.log('POST /api/cache/clear: Кеш модулей очищен');
      } catch (e) {
        console.log('POST /api/cache/clear: Ошибка при очистке кеша модулей:', e);
      }
    }

    // Устанавливаем заголовки для принудительного обновления кеша браузера
    const response = NextResponse.json({
      success: true,
      message: 'Запрос на очистку кеша выполнен',
      timestamp: new Date().toISOString()
    });

    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('POST /api/cache/clear: Ошибка:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при очистке кеша' },
      { status: 500 }
    );
  }
} 