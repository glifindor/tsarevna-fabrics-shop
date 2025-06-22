import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Получение корзины пользователя
export async function GET(req: NextRequest) {
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
    console.error('Ошибка при получении корзины:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении корзины', error },
      { status: 500 }
    );
  }
}

// Добавление товара в корзину
export async function POST(req: NextRequest) {
  console.log('POST запрос к /api/cart получен');
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('POST /api/cart: Пользователь не авторизован');
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const userId = session.user.id;
    const body = await req.json();
    console.log('POST /api/cart: Получены данные', { userId, body });
    
    // Проверка обязательных полей
    if (!body.productId || !body.quantity) {
      console.log('POST /api/cart: Не указаны обязательные поля', body);
      return NextResponse.json(
        { success: false, message: 'Не указан ID товара или количество' },
        { status: 400 }
      );
    }
    
    // Проверка существования товара
    const product = await Product.findById(body.productId);
    console.log('POST /api/cart: Поиск продукта', { productId: body.productId, found: !!product });
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Товар не найден' },
        { status: 404 }
      );
    }
    
    // Проверка наличия на складе
    console.log('POST /api/cart: Проверка наличия', { stock: product.stock, requested: body.quantity });
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
    console.log('POST /api/cart: Поиск корзины', { userId, cartFound: !!cart });
    
    // Если корзины нет, создаем новую
    if (!cart) {
      console.log('POST /api/cart: Создание новой корзины');
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
      console.log('POST /api/cart: Проверка товара в корзине', { itemIndex, items: cart.items });
      
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
    console.error('Ошибка при добавлении товара в корзину:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при добавлении товара в корзину', error },
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
export async function DELETE(req: NextRequest) {
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
    
    // Удаляем корзину
    await Cart.findOneAndDelete({ userId });
    
    return NextResponse.json({
      success: true,
      message: 'Корзина очищена'
    });
  } catch (error) {
    console.error('Ошибка при очистке корзины:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при очистке корзины', error },
      { status: 500 }
    );
  }
}
