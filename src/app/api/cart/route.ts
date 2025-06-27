import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Получение корзины пользователя
export async function GET() {
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
    
    // Поиск корзины пользователя
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    
    // Если корзины нет, создаем пустую
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: []
      });
    }
    
    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    logger.error('Ошибка при получении корзины:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении корзины', error },
      { status: 500 }
    );
  }
}

// Добавление товара в корзину
export async function POST(req: NextRequest) {
  logger.log('POST запрос к /api/cart получен');
  let body: any = {};
  let session: any = null;
  
  try {
    session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      logger.log('POST /api/cart: Пользователь не авторизован');
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const userId = session.user.id;
    body = await req.json();
    logger.log('POST /api/cart: Получены данные', { userId, body });
    
    // Проверка обязательных полей
    if (!body.productId || !body.quantity) {
      logger.log('POST /api/cart: Не указаны обязательные поля', body);
      return NextResponse.json(
        { success: false, message: 'Не указан ID товара или количество' },
        { status: 400 }
      );
    }
    
    // Проверка существования товара
    logger.log('POST /api/cart: Начинаем поиск продукта', { productId: body.productId, type: typeof body.productId });
    
    let product;
    try {
      product = await Product.findById(body.productId);
      logger.log('POST /api/cart: Поиск продукта завершен', { productId: body.productId, found: !!product });
    } catch (productError) {
      logger.error('POST /api/cart: Ошибка при поиске продукта', { productId: body.productId, error: productError });
      return NextResponse.json(
        { success: false, message: 'Некорректный ID товара', error: productError },
        { status: 400 }
      );
    }
    
    if (!product) {
      logger.log('POST /api/cart: Товар не найден в БД', { productId: body.productId });
      return NextResponse.json(
        { success: false, message: 'Товар не найден' },
        { status: 404 }
      );
    }
    
    // Проверка наличия на складе
    logger.log('POST /api/cart: Проверка наличия', { stock: product.stock, requested: body.quantity });
    if (product.stock < body.quantity) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Недостаточно товара на складе',
          available: product.stock 
        },
        { status: 400 }
      );
    }
    
    // Поиск корзины пользователя
    let cart = await Cart.findOne({ userId });
    logger.log('POST /api/cart: Поиск корзины', { userId, cartFound: !!cart });
    
    // Если корзины нет, создаем новую
    if (!cart) {
      logger.log('POST /api/cart: Создание новой корзины');
      cart = await Cart.create({
        userId,
        items: [{
          productId: body.productId,
          quantity: body.quantity
        }]
      });
    } else {
      // Проверяем, есть ли товар уже в корзине
      const itemIndex = cart.items.findIndex(
        (item: any) => item.productId && item.productId.toString() === body.productId
      );
      logger.log('POST /api/cart: Проверка товара в корзине', { itemIndex, items: cart.items });
      
      if (itemIndex > -1) {
        // Обновляем количество
        cart.items[itemIndex].quantity = body.quantity;
      } else {
        // Добавляем новый товар
        cart.items.push({
          productId: body.productId,
          quantity: body.quantity
        });
      }
      
      await cart.save();
    }
    
    // Получаем обновленную корзину с данными о товарах
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId');
    
    return NextResponse.json({
      success: true,
      message: 'Товар добавлен в корзину',
      data: updatedCart
    });
  } catch (error) {
    logger.error('POST /api/cart: Критическая ошибка', { 
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      body,
      userId: session?.user?.id
    });
    return NextResponse.json(
      { success: false, message: 'Ошибка при добавлении товара в корзину', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Обновление всей корзины
export async function PUT(req: NextRequest) {
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
    
    // Проверка обязательных полей
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, message: 'Некорректный формат данных' },
        { status: 400 }
      );
    }
    
    // Проверка наличия товаров на складе
    for (const item of body.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Товар с ID ${item.productId} не найден` },
          { status: 404 }
        );
      }
      
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Недостаточно товара "${product.name}" на складе`,
            available: product.stock,
            productId: product._id
          },
          { status: 400 }
        );
      }
    }
    
    // Обновляем корзину
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: body.items },
      { new: true, upsert: true }
    ).populate('items.productId');
    
    return NextResponse.json({
      success: true,
      message: 'Корзина обновлена',
      data: cart
    });
  } catch (error) {
    console.error('Ошибка при обновлении корзины:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении корзины', error },
      { status: 500 }
    );
  }
}

// Удаление всей корзины
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      logger.log('DELETE /api/cart: Пользователь не авторизован');
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const userId = session.user.id;
    logger.log('DELETE /api/cart: Очистка корзины для пользователя', { userId });
    
    // Удаляем корзину
    const deletedCart = await Cart.findOneAndDelete({ userId });
    logger.log('DELETE /api/cart: Результат удаления', { deleted: !!deletedCart });
    
    return NextResponse.json({
      success: true,
      message: 'Корзина очищена'
    });
  } catch (error) {
    logger.error('Ошибка при очистке корзины:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при очистке корзины', error },
      { status: 500 }
    );
  }
}
