import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { id } = await params;
    const userId = id;
    
    // Пользователь может получить только свои данные, админ - любые
    if (session.user.role !== 'admin' && userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав для просмотра данных пользователя' },
        { status: 403 }
      );
    }
    
    const user = await User.findById(userId, { password: 0 }); // Исключаем пароль из выборки
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении данных пользователя', error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { id } = await params;
    const userId = id;
    const body = await req.json();
    
    // Пользователь может обновить только свои данные, админ - любые
    if (session.user.role !== 'admin' && userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав для изменения данных пользователя' },
        { status: 403 }
      );
    }
    
    // Находим пользователя
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    // Обычный пользователь не может изменить свою роль
    if (session.user.role !== 'admin' && body.role) {
      delete body.role;
    }
    
    // Если указан новый email, проверяем, не занят ли он
    if (body.email && body.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: body.email,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Пользователь с таким email уже существует' },
          { status: 400 }
        );
      }
    }
    
    // Создаем объект для обновления
    const updateData: any = {};
    
    // Добавляем только разрешенные поля
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    
    // Только админ может менять роль
    if (session.user.role === 'admin' && body.role) {
      updateData.role = body.role;
    }
    
    // Обновляем данные пользователя
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password'); // Исключаем пароль из ответа
    
    return NextResponse.json({
      success: true,
      message: 'Данные пользователя обновлены',
      data: updatedUser
    });
  } catch (error) {
    console.error('Ошибка при обновлении данных пользователя:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении данных пользователя', error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав для выполнения операции' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const { id } = await params;
    const userId = id;
    
    // Проверяем, существует ли пользователь
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    // Предотвращаем удаление последнего админа
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: 'Невозможно удалить последнего администратора' },
          { status: 400 }
        );
      }
    }
    
    // Удаляем пользователя
    await User.findByIdAndDelete(userId);
    
    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при удалении пользователя', error },
      { status: 500 }
    );
  }
}
