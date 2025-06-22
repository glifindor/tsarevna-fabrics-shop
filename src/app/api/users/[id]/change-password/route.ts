import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    
    // Пользователь может менять только свой пароль, админ - любой
    if (session.user.role !== 'admin' && userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав для изменения пароля' },
        { status: 403 }
      );
    }
    
    // Проверка наличия полей
    if (!body.newPassword) {
      return NextResponse.json(
        { success: false, message: 'Необходимо указать новый пароль' },
        { status: 400 }
      );
    }
    
    // Если пользователь меняет свой пароль, требуем текущий пароль
    if (userId === session.user.id && !body.currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Необходимо указать текущий пароль' },
        { status: 400 }
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
    
    // Если пользователь меняет свой пароль, проверяем текущий пароль
    if (userId === session.user.id) {
      const isPasswordValid = await user.comparePassword(body.currentPassword);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Неверный текущий пароль' },
          { status: 400 }
        );
      }
    }
    
    // Обновляем пароль
    user.password = body.newPassword;
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    console.error('Ошибка при изменении пароля:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при изменении пароля', error },
      { status: 500 }
    );
  }
}
