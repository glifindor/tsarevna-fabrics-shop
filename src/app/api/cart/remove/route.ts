import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Удаление товара из корзины
export async function POST(req: NextRequest) {
  console.log('POST запрос к /api/cart/remove получен');
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const userId = session.user.id;
    const body = await req.json();
    const { productId } = body;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Не указан ID товара' },
        { status: 400 }
      );
    }
    
    console.log('POST /api/cart/remove: Удаление товара', { productId });
    
    // Находим корзину пользователя
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Корзина не найдена' },
        { status: 404 }
      );
    }
    
    // Удаляем товар из корзины
    cart.items = cart.items.filter((item: any) => {
      const itemProductId = item.productId.toString();
      return itemProductId !== productId;
    });
    
    // Сохраняем обновленную корзину
    await cart.save();
    
    // Получаем обновленную корзину с данными о товарах
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId');
    
    return NextResponse.json({
      success: true,
      message: 'Товар удален из корзины',
      data: updatedCart
    });
  } catch (error) {
    console.error('Ошибка при удалении товара из корзины:', error);
    
    // Подробное логирование ошибки для отладки
    let errorMessage = 'Ошибка при удалении товара из корзины';
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
