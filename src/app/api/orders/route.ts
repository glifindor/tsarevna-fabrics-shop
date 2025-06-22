import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Получение списка заказов пользователя
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
    
    const url = new URL(req.url);
    const stats = url.searchParams.get('stats');
    const userId = session.user.id;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // Для админов показываем все заказы, для обычных пользователей - только их заказы
    const filter = session.user.role === 'admin' ? {} : { userId };
    
    // Если запрошена статистика
    if (stats) {
      // Агрегация по всем заказам
      const orders = await Order.find(filter).populate('items.productId');
      const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const customers = new Set(orders.map(o => o.userId?.toString())).size;
      const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
      // Продажи по датам (по неделям)
      const salesByDateMap = new Map();
      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const week = `${d.getFullYear()}-W${Math.ceil((d.getDate() + 6 - d.getDay()) / 7)}`;
        salesByDateMap.set(week, (salesByDateMap.get(week) || 0) + (o.totalAmount || 0));
      });
      const salesByDate = Array.from(salesByDateMap.entries()).map(([date, amount]) => ({ date, amount }));
      // Топ-товары
      const productMap = new Map();
      orders.forEach((o: any) => {
        o.items.forEach((item: any) => {
          const pid = item.productId?._id?.toString() || item.productId?.toString();
          if (!pid) return;
          const key = pid;
          const name = item.productId?.name || 'Товар';
          const amount = (item.price || 0) * (item.quantity || 0);
          if (!productMap.has(key)) productMap.set(key, { productId: key, productName: name, quantity: 0, amount: 0 });
          const entry = productMap.get(key);
          entry.quantity += item.quantity || 0;
          entry.amount += amount;
        });
      });
      const topProducts = Array.from(productMap.values()).sort((a, b) => b.amount - a.amount).slice(0, 5);
      // Продажи по категориям
      const categoryMap = new Map();
      orders.forEach((o: any) => {
        o.items.forEach((item: any) => {
          const cat = item.productId?.category || 'Другое';
          const amount = (item.price || 0) * (item.quantity || 0);
          if (!categoryMap.has(cat)) categoryMap.set(cat, { category: cat, quantity: 0, amount: 0 });
          const entry = categoryMap.get(cat);
          entry.quantity += item.quantity || 0;
          entry.amount += amount;
        });
      });
      const salesByCategory = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
      // Последние заказы
      const recentOrders = orders.slice(0, 5).map(o => ({
        id: o.orderNumber || o._id,
        customer: o.customerName,
        date: o.createdAt,
        amount: o.totalAmount,
        status: o.status
      }));
      return NextResponse.json({
        success: true,
        data: {
          totalSales,
          totalOrders,
          totalCustomers: customers,
          averageOrderValue,
          salesByDate,
          topProducts,
          salesByCategory,
          recentOrders
        }
      });
    }
    
    // Считаем общее количество заказов
    const totalOrders = await Order.countDocuments(filter);
    
    // Получаем заказы с пагинацией
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('items.productId');
    
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      }
    });
  } catch (error) {
    console.error('Ошибка при получении списка заказов:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении списка заказов', error },
      { status: 500 }
    );
  }
}

// Создание нового заказа
export async function POST(req: NextRequest) {
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
    if (!body.customerName || !body.phone || !body.email || !body.deliveryMethod || !body.paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Не заполнены обязательные поля' },
        { status: 400 }
      );
    }
    
    // Если выбрана доставка, адрес обязателен
    if (body.deliveryMethod === 'delivery' && !body.address) {
      return NextResponse.json(
        { success: false, message: 'Необходимо указать адрес доставки' },
        { status: 400 }
      );
    }
    
    // Проверяем, есть ли корзина у пользователя
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Корзина пуста' },
        { status: 400 }
      );
    }
    
    // Проверяем наличие товаров на складе
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { success: false, message: 'Один из товаров не найден' },
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
      // Рассчитываем общую сумму заказа
    const totalAmount = cart.items.reduce((sum: number, item: any) => {
      const product = item.productId as any;
      return sum + (product.price * item.quantity);
    }, 0);
    
    // Создаем заказ
    const orderNumber = 'TS' + Math.floor(100000 + Math.random() * 900000);
    const order = await Order.create({
      orderNumber,
      userId,
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      address: body.address || '',
      deliveryMethod: body.deliveryMethod,
      paymentMethod: body.paymentMethod,
      comment: body.comment || '',      items: cart.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: (item.productId as any).price
      })),
      totalAmount,
      status: 'pending'
    });
    
    // Обновляем количество товаров на складе
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    // Очищаем корзину
    await Cart.findOneAndDelete({ userId });
    
    // Здесь можно добавить отправку уведомления на email
    
    return NextResponse.json({
      success: true,
      message: 'Заказ успешно оформлен',
      data: {
        orderId: order._id,
        orderNumber
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при оформлении заказа', error },
      { status: 500 }
    );
  }
}
