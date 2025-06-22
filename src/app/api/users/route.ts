import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Регистрация нового пользователя
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    // Проверка обязательных полей
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Не заполнены обязательные поля' },
        { status: 400 }
      );
    }
    
    // Проверка, существует ли пользователь с таким email
    const existingUser = await User.findOne({ email: body.email });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }
    
    // Создаем нового пользователя
    const user = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
      role: 'user' // По умолчанию обычный пользователь
    });
    
    // Удаляем пароль из ответа
    const userObject = user.toObject();
    delete userObject.password;
    
    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: userObject
    }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при регистрации пользователя', error },
      { status: 500 }
    );
  }
}

// Получение списка пользователей (только для админов)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав для выполнения операции' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // Считаем общее количество пользователей
    const totalUsers = await User.countDocuments();
    
    // Получаем пользователей с пагинацией
    const users = await User.find({}, { password: 0 }) // Исключаем пароль из выборки
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      }
    });
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении списка пользователей', error },
      { status: 500 }
    );
  }
}
