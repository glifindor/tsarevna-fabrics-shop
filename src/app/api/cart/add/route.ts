import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Добавление товара в корзину
export async function POST(req: NextRequest) {
  logger.log('POST запрос к /api/cart/add получен');
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      logger.log('POST /api/cart/add: Пользователь не авторизован');
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const userId = session.user.id;
    const body = await req.json();
    console.log('POST /api/cart/add: Получены данные', { userId, body });
    
    // Проверка обязательных полей
    if (!body.productId || !body.quantity) {
      console.log('POST /api/cart/add: Не указаны обязательные поля', body);
      return NextResponse.json(
        { success: false, message: 'Не указан ID товара или количество' },
        { status: 400 }
      );
    }
      // Проверка существования товара
    console.log('POST /api/cart/add: Проверка входящего productId:', body.productId);
    
    // Проверяем, является ли productId числом (из тестовых данных) или строкой ObjectId
    let product = null;
    
    // Сначала пробуем найти по артикулу (независимо от типа productId)
    product = await Product.findOne({ articleNumber: body.productId.toString() });
    console.log('POST /api/cart/add: Поиск по articleNumber:', { 
      articleNumber: body.productId, 
      found: !!product 
    });
    
    // Если не нашли точное совпадение, пробуем регистронезависимый поиск
    if (!product) {
      product = await Product.findOne({ 
        articleNumber: { $regex: new RegExp('^' + body.productId.toString() + '$', 'i') } 
      });
      console.log('POST /api/cart/add: Регистронезависимый поиск по articleNumber:', { 
        articleNumber: body.productId, 
        found: !!product 
      });
    }
    
    // Если не нашли по артикулу, пробуем другие методы
    if (!product) {
      if (isNaN(Number(body.productId))) {
        // Если это похоже на ObjectId
        try {
          product = await Product.findById(body.productId);
          console.log('POST /api/cart/add: Поиск по ObjectId:', { 
            id: body.productId, 
            found: !!product 
          });
        } catch (err) {
          console.error('Ошибка поиска по ID:', err);
        }
      } else {
        // Если это число (например, из тестовых данных)
        product = await Product.findOne({ id: Number(body.productId) });
        console.log('POST /api/cart/add: Поиск по числовому id:', { 
          id: Number(body.productId), 
          found: !!product 
        });
      }
    }
    
    // Последняя попытка - проверим все товары с похожим артикулом
    if (!product) {
      const similarProducts = await Product.find({ 
        articleNumber: { $regex: body.productId.toString(), $options: 'i' } 
      }).limit(5);
      
      console.log('POST /api/cart/add: Поиск похожих артикулов:', { 
        query: body.productId,
        found: similarProducts.length,
        results: similarProducts.map(p => ({
          id: p._id,
          articleNumber: p.articleNumber,
          name: p.name
        }))
      });
      
      if (similarProducts.length > 0) {
        product = similarProducts[0]; // Используем первый найденный товар
      }
    }
    
    console.log('POST /api/cart/add: Результат поиска продукта', { 
      productId: body.productId, 
      found: !!product, 
      product: product ? {
        id: product._id,
        name: product.name,
        articleNumber: product.articleNumber
      } : null
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Товар не найден' },
        { status: 404 }
      );
    }
    
    // Проверка наличия на складе
    console.log('POST /api/cart/add: Проверка наличия', { stock: product.stock, requested: body.quantity });
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
    console.log('POST /api/cart/add: Поиск корзины', { userId, cartFound: !!cart });
    
    // Если корзины нет, создаем новую
    if (!cart) {
      console.log('POST /api/cart/add: Создание новой корзины');
      cart = await Cart.create({
        userId,
        items: [{
          productId: product._id.toString(), // Используем _id из найденного продукта
          quantity: body.quantity
        }]
      });
    } else {
      // Проверяем, есть ли товар уже в корзине
      const itemIndex = cart.items.findIndex((item: any) => {
        if (!item.productId) return false;
        
        // Сравниваем как строки и проверяем несколько вариантов
        // 1. По ObjectId
        if (item.productId.toString() === product._id.toString()) return true;
        
        // 2. По числовому ID (для демо-товаров)
        if (product.id && item.productId.toString() === product.id.toString()) return true;
        
        // 3. По артикулу (для поиска по articleNumber)
        if (product.articleNumber && item.productId.toString() === product.articleNumber) return true;
        
        return false;
      });
      
      console.log('POST /api/cart/add: Проверка товара в корзине', { 
        itemIndex, 
        itemsCount: cart.items.length,
        productId: product._id,
        items: cart.items.map((i: any) => ({ 
          id: i.productId?.toString(), 
          qty: i.quantity 
        }))
      });
      
      if (itemIndex > -1) {
        // Обновляем количество
        cart.items[itemIndex].quantity = body.quantity;
      } else {
        // Добавляем новый товар и приводим productId к строке
        // для совместимости с MongoDB ObjectId
        cart.items.push({
          productId: product._id.toString(), // Используем _id из найденного продукта
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
    
    // Подробное логирование ошибки для отладки
    let errorMessage = 'Ошибка при добавлении товара в корзину';
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
