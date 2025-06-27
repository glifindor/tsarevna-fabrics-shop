import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('POST запрос к /api/upload получен');
    
    // Проверка авторизации - только админы могут загружать файлы
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Требуются права администратора' },
        { status: 403 }
      );
    }
    
    // Получаем данные формы
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      console.log('POST /api/upload: Файл не найден в запросе');
      return NextResponse.json(
        { success: false, message: 'Файл не найден' }, 
        { status: 400 }
      );
    }

    // Проверка типа файла (разрешаем только изображения)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('POST /api/upload: Недопустимый тип файла', file.type);
      return NextResponse.json(
        { success: false, message: 'Недопустимый тип файла. Разрешены только изображения.' }, 
        { status: 400 }
      );
    }

    // Проверка размера файла (ограничение 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('POST /api/upload: Превышен размер файла', { size: file.size, maxSize });
      return NextResponse.json(
        { success: false, message: 'Размер файла не должен превышать 5MB' }, 
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем уникальное имя файла с префиксом timestamp и случайным числом
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExtension}`;
    
    // Формируем путь для сохранения файла
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadsDir, fileName);
    
    // Проверяем существование директории и создаем ее при необходимости
    if (!existsSync(uploadsDir)) {
      console.log('POST /api/upload: Создание директории для загрузок', uploadsDir);
      await mkdir(uploadsDir, { recursive: true });
    }

    // Сохраняем файл
    console.log('POST /api/upload: Сохранение файла', { fileName, path: filePath });
    console.log('POST /api/upload: Размер буфера:', buffer.length);
    console.log('POST /api/upload: Рабочая директория:', process.cwd());
    console.log('POST /api/upload: Папка uploads:', uploadsDir);
    
    await writeFile(filePath, buffer);
    
    // Проверяем, что файл действительно создался
    if (existsSync(filePath)) {
      console.log('POST /api/upload: Файл успешно создан, размер:', require('fs').statSync(filePath).size);
    } else {
      console.error('POST /api/upload: ОШИБКА - файл не создался!');
    }
    
    const fileUrl = `/uploads/${fileName}`;
    console.log('POST /api/upload: Файл успешно загружен', { url: fileUrl });
    
    // Дополнительная проверка - перечислим файлы в папке uploads
    try {
      const fs = require('fs');
      const files = fs.readdirSync(uploadsDir);
      console.log('POST /api/upload: Файлы в uploads после загрузки:', files);
    } catch (e) {
      console.log('POST /api/upload: Ошибка при чтении папки uploads:', e);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Файл успешно загружен',
      url: fileUrl,
      fileName,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    
    // Подробное логирование ошибки для отладки
    let errorMessage = 'Ошибка загрузки файла';
    let errorDetails = null;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack
      };
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: errorDetails || String(error)
      },
      { status: 500 }
    );
  }
}
