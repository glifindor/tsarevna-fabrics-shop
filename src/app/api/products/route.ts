import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '12', 10);
    
    const filter: any = {};
    
    // Добавляем фильтры, если они указаны
    if (category) {
      filter.category = category;
    }
    
    // Добавляем полнотекстовый поиск, если указан
    if (search && search.trim() !== '') {
      filter.$text = { $search: search };
    }
    
    // Считаем общее количество товаров для пагинации
    const totalProducts = await Product.countDocuments(filter);
    
    // Получаем товары с учетом пагинации
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      }
    });
  } catch (error) {
    console.error('Ошибка при получении списка товаров:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении списка товаров', error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Проверяем авторизацию и роль
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав для выполнения операции' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const body = await req.json();
      // Валидация данных
    if (!body.name || !body.price || !body.articleNumber || !body.category) {
      console.log('Validation failed:', { 
        name: body.name ? 'Valid' : 'Missing', 
        price: body.price ? 'Valid' : 'Missing', 
        articleNumber: body.articleNumber ? 'Valid' : 'Missing', 
        category: body.category ? 'Valid' : 'Missing'
      });
      return NextResponse.json(
        { success: false, message: 'Необходимо заполнить все обязательные поля', missingFields: {
          name: !body.name,
          price: !body.price,
          articleNumber: !body.articleNumber,
          category: !body.category
        } },
        { status: 400 }
      );
    }
    
    // Логирование входящих данных
    console.log('Creating product with data:', { 
      name: body.name,
      price: body.price,
      articleNumber: body.articleNumber,
      category: body.category,
      fullBody: body
    });
    
    // Проверяем, существует ли товар с таким артикулом
    const existingProduct = await Product.findOne({ articleNumber: body.articleNumber });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Товар с таким артикулом уже существует' },
        { status: 400 }
      );
    }
      // Создаем новый товар
    try {
      // Принудительно убеждаемся, что категория - строка
      if (body.category) {
        body.category = String(body.category).trim();
      }
      
      const product = await Product.create(body);
      
      console.log('Product created successfully:', product);
      
      return NextResponse.json(
        { success: true, message: 'Товар успешно создан', data: product },
        { status: 201 }
      );
    } catch (createError) {
      console.error('Error creating product:', createError);
      return NextResponse.json(
        { success: false, message: 'Ошибка при создании товара', error: createError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при создании товара', error },
      { status: 500 }
    );
  }
}
