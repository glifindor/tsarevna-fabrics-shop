import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Получаем путь к файлу
    const resolvedParams = await params;
    const filePath = resolvedParams.path?.join('/') || '';
    
    if (!filePath) {
      return NextResponse.json(
        { success: false, message: 'Путь к файлу не указан' },
        { status: 400 }
      );
    }

    // Полный путь к файлу в папке uploads
    const fullPath = join(process.cwd(), 'public', 'uploads', filePath);
    
    // Проверяем существование файла
    if (!existsSync(fullPath)) {
      console.log('Файл не найден:', fullPath);
      return NextResponse.json(
        { success: false, message: 'Файл не найден' },
        { status: 404 }
      );
    }

    // Читаем файл
    const fileBuffer = await readFile(fullPath);
    
    // Определяем MIME-тип на основе расширения файла
    const extension = filePath.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
      case 'svg':
        mimeType = 'image/svg+xml';
        break;
    }

    // Возвращаем файл с правильными заголовками
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000', // Кэшируем на год
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Ошибка при отдаче файла:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка сервера' },
      { status: 500 }
    );
  }
} 