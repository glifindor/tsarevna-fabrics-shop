import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
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
    const orderId = id;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Необходимо указать ID заказа' },
        { status: 400 }
      );
    }
    
    // Находим заказ
    const order = await Order.findById(orderId).populate('items.productId');
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
    // Проверяем права доступа
    if (session.user.role !== 'admin' && order.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав для просмотра заказа' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Ошибка при получении информации о заказе:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении информации о заказе', error },
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
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав для выполнения операции' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const { id } = await params;
    const orderId = id;
    const body = await req.json();
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Необходимо указать ID заказа' },
        { status: 400 }
      );
    }
    
    // Проверяем существование заказа
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
    // Обновляем статус заказа
    if (body.status) {
      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(body.status)) {
        return NextResponse.json(
          { success: false, message: 'Некорректный статус заказа' },
          { status: 400 }
        );
      }
      
      order.status = body.status;
    }
    
    // Обновляем поля, которые разрешено обновлять
    if (body.trackingNumber) {
      order.trackingNumber = body.trackingNumber;
    }
    
    if (body.adminComment) {
      order.adminComment = body.adminComment;
    }
    
    await order.save();
    
    return NextResponse.json({
      success: true,
      message: 'Заказ успешно обновлен',
      data: order
    });
  } catch (error) {
    console.error('Ошибка при обновлении заказа:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении заказа', error },
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
    const orderId = id;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Необходимо указать ID заказа' },
        { status: 400 }
      );
    }
    
    // Проверяем существование заказа
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Заказ не найден' },
        { status: 404 }
      );
    }
    
    // Удаляем заказ (обычно в реальных системах заказы не удаляют,
    // а просто меняют статус на "отменен")
    await Order.findByIdAndDelete(orderId);
    
    return NextResponse.json({
      success: true,
      message: 'Заказ успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении заказа:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при удалении заказа', error },
      { status: 500 }
    );
  }
}
