import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {    await dbConnect();
    
    const { slug } = await params;
    const productId = slug;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Необходимо указать идентификатор товара' },
        { status: 400 }
      );
    }
    
    // Улучшенный поиск товара по разным полям
    let product;
    
    console.log(`🔍 Поиск товара: ${productId}`);
    
    try {
      // 1. Сначала пробуем найти по _id (если это валидный ObjectId)
      if (productId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log(`🔍 Поиск по MongoDB ObjectId: ${productId}`);
        product = await Product.findById(productId);
        if (product) {
          console.log(`✅ Товар найден по ID: ${product.name} (${product.articleNumber})`);
        }
      }
      
      // 2. Если не нашли, пробуем по артикулу
      if (!product) {
        console.log(`🔍 Поиск по артикулу: ${productId}`);
        product = await Product.findOne({ articleNumber: productId });
        if (product) {
          console.log(`✅ Товар найден по артикулу: ${product.name} (ID: ${product._id})`);
        }
      }
      
      // 3. Если все еще не нашли, пробуем по slug
      if (!product) {
        console.log(`🔍 Поиск по slug: ${productId}`);
        product = await Product.findOne({ slug: productId });
        if (product) {
          console.log(`✅ Товар найден по slug: ${product.name} (ID: ${product._id})`);
        }
      }
      
      // 4. Последняя попытка - поиск по названию (частичное совпадение)
      if (!product) {
        console.log(`🔍 Поиск по названию: ${productId}`);
        product = await Product.findOne({ 
          name: { $regex: productId, $options: 'i' } 
        });
        if (product) {
          console.log(`✅ Товар найден по названию: ${product.name} (ID: ${product._id})`);
        }
      }
      
      // 5. Показать все товары в базе для отладки
      if (!product) {
        console.log(`❌ Товар не найден. Показываю все товары в базе:`);
        const allProducts = await Product.find({}).limit(10);
        allProducts.forEach((p, index) => {
          console.log(`${index + 1}. ID: ${p._id}, Артикул: ${p.articleNumber}, Название: ${p.name}`);
        });
      }
      
    } catch (findError) {
      console.error('❌ Ошибка при поиске товара:', findError);
    }
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Товар не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Ошибка при получении информации о товаре:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении информации о товаре', error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
    
    const { slug } = await params;
    const productId = slug;
    const body = await req.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Необходимо указать идентификатор товара' },
        { status: 400 }
      );
    }
    
    // Проверяем, существует ли товар
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Товар не найден' },
        { status: 404 }
      );
    }
    
    // Проверяем, не занят ли артикул другим товаром
    if (body.articleNumber && body.articleNumber !== product.articleNumber) {
      const existingProduct = await Product.findOne({ 
        articleNumber: body.articleNumber,
        _id: { $ne: productId }
      });
      
      if (existingProduct) {
        return NextResponse.json(
          { success: false, message: 'Товар с таким артикулом уже существует' },
          { status: 400 }
        );
      }
    }    // Обновляем товар
    try {
      // Принудительно убеждаемся, что категория - строка
      if (body.category) {
        body.category = String(body.category).trim();
      }
      
      console.log('Updating product. ID:', productId, 'Data:', body);
      
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: body },
        { new: true, runValidators: true }
      );
      
      console.log('Product updated successfully:', updatedProduct);
      
      return NextResponse.json({
        success: true,
        message: 'Товар успешно обновлен',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { success: false, message: 'Ошибка при обновлении товара', error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Ошибка при обновлении товара:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении товара', error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Проверяем авторизацию и роль
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав для выполнения операции' },
        { status: 403 }
      );    }
    
    await dbConnect();
    
    const { slug } = await params;
    const productId = slug;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Необходимо указать идентификатор товара' },
        { status: 400 }
      );
    }
    
    // Проверяем, существует ли товар
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Товар не найден' },
        { status: 404 }
      );
    }
    
    // Удаляем товар
    await Product.findByIdAndDelete(productId);
    
    return NextResponse.json({
      success: true,
      message: 'Товар успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при удалении товара', error },
      { status: 500 }
    );
  }
}
