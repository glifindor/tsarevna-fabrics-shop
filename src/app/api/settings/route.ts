import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Получить текущие настройки
export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      // Если нет настроек, создаём с дефолтными значениями
      settings = await Settings.create({
        shopName: 'Царевна Ткани',
        shopDescription: 'Магазин высококачественных тканей для воплощения ваших творческих идей в жизнь.',
        shopPhone: '+7 (800) 123-45-67',
        shopEmail: 'info@tsarevna-fabrics.ru',
        shopAddress: 'г. Москва, ул. Текстильщиков, 10, ТЦ \'Мануфактура\'',
        enablePickup: true,
        enableDelivery: true,
        enableCash: true,
        enableCard: true
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Ошибка при получении настроек', error }, { status: 500 });
  }
}

// Обновить настройки (только admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Недостаточно прав' }, { status: 403 });
    }
    await dbConnect();
    const body = await req.json();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Ошибка при сохранении настроек', error }, { status: 500 });
  }
} 