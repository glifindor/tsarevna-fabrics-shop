import dbConnect from '@/lib/db';
import Product from '@/models/Product';

const sampleProducts = [
  {
    name: "Хлопок Премиум",
    articleNumber: "CP001",
    description: "Высококачественный хлопок премиум-класса. Идеально подходит для пошива одежды, постельного белья и других изделий.",
    price: 850,
    composition: "100% хлопок",
    category: "cotton",
    stock: 150,
    images: ["/cotton-premium.jpg"]
  },
  {
    name: "Лен Итальянский",
    articleNumber: "LI002",
    description: "Натуральный итальянский лен высшего качества. Подходит для пошива летней одежды, скатертей, салфеток.",
    price: 1200,
    composition: "100% лен",
    category: "linen",
    stock: 80,
    images: ["/linen-italian.jpg"]
  },
  {
    name: "Шелк Натуральный",
    articleNumber: "SN003",
    description: "Роскошный натуральный шелк. Идеален для пошива вечерних нарядов, блузок, платьев.",
    price: 2300,
    composition: "100% шелк",
    category: "silk",
    stock: 45,
    images: ["/silk-natural.jpg"]
  }
];

async function ensureProductsExist() {
  try {
    console.log('Подключение к базе данных...');
    await dbConnect();
    
    for (const product of sampleProducts) {
      // Проверяем, есть ли товар с таким артикулом
      const existingProduct = await Product.findOne({ articleNumber: product.articleNumber });
      
      if (!existingProduct) {
        console.log(`Добавление товара с артикулом ${product.articleNumber}...`);
        await Product.create(product);
        console.log(`Товар "${product.name}" (${product.articleNumber}) успешно добавлен!`);
      } else {
        console.log(`Товар с артикулом ${product.articleNumber} уже существует, пропускаем.`);
      }
    }
    
    console.log('Операция завершена.');
    
  } catch (error) {
    console.error('Ошибка при инициализации товаров:', error);
  }
}

// Запускаем функцию инициализации
ensureProductsExist().then(() => {
  console.log('Скрипт инициализации товаров завершен.');
});
