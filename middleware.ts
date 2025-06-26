import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Обработка статических файлов в /uploads/
  if (pathname.startsWith('/uploads/')) {
    // Разрешаем прямой доступ к статическим файлам
    return NextResponse.next();
  }

  // Для всех остальных запросов продолжаем обычную обработку
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 