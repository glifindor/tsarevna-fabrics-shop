import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Получить все категории
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({});
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Ошибка при получении категорий', error }, { status: 500 });
  }
}

// Создать новую категорию (только admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Недостаточно прав' }, { status: 403 });
    }
    await dbConnect();
    const body = await req.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, message: 'Необходимо указать название и слаг' }, { status: 400 });
    }
    const category = await Category.create({ name: body.name, slug: body.slug, image: body.image || '' });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Ошибка при создании категории', error }, { status: 500 });
  }
} 