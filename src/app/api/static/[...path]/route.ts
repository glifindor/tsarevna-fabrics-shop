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
      return new NextResponse('File path required', { status: 400 });
    }

    // Полный путь к файлу в папке uploads
    const fullPath = join(process.cwd(), 'public', 'uploads', filePath);
    
    console.log('Static file request:', filePath);
    console.log('Full path:', fullPath);
    
    // Проверяем существование файла
    if (!existsSync(fullPath)) {
      console.log('File not found:', fullPath);
      return new NextResponse('File not found', { status: 404 });
    }

    // Читаем файл
    const fileBuffer = await readFile(fullPath);
    
    // Определяем MIME-тип
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

    // Возвращаем файл
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new NextResponse('Server error', { status: 500 });
  }
} 