import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Пропускаем статические файлы uploads напрямую к файловой системе
  if (pathname.startsWith('/uploads/')) {
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
     * - uploads (статические изображения)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}; 