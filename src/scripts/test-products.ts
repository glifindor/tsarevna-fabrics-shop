import dbConnect from '@/lib/db';
import Product from '@/models/Product';

async function testProductSearch() {
  try {
    console.log('Подключение к базе данных...');
    await dbConnect();
    
    // Тестовые артикулы из логов
    const articleNumbers = ['CP001', 'SN003', 'LI002'];
    
    for (const articleNumber of articleNumbers) {
      console.log(`\nПоиск товара по артикулу: ${articleNumber}`);
      
      // Поиск по артикулу
      const product = await Product.findOne({ articleNumber });
      
      if (product) {
        console.log('Товар найден:', {
          id: product._id,
          name: product.name,
          articleNumber: product.articleNumber,
          price: product.price
        });
      } else {
        console.log(`Товар с артикулом ${articleNumber} НЕ найден`);
        
        // Проверим регистр
        const caseInsensitiveProduct = await Product.findOne({ 
          articleNumber: { $regex: new RegExp('^' + articleNumber + '$', 'i') } 
        });
        
        if (caseInsensitiveProduct) {
          console.log('Товар найден при регистронезависимом поиске:', {
            id: caseInsensitiveProduct._id,
            name: caseInsensitiveProduct.name,
            articleNumber: caseInsensitiveProduct.articleNumber,
            price: caseInsensitiveProduct.price
          });
        }
      }
    }
    
    // Проверим общее количество товаров в базе
    const productsCount = await Product.countDocuments();
    console.log(`\nВсего товаров в базе данных: ${productsCount}`);
    
    // Получим все артикулы
    const allProducts = await Product.find({}, 'articleNumber name');
    console.log('\nВсе артикулы в базе данных:');
    allProducts.forEach(p => console.log(`- ${p.articleNumber}: ${p.name}`));
    
  } catch (error) {
    console.error('Ошибка при тестировании поиска товаров:', error);
  } finally {
    process.exit(0);
  }
}

testProductSearch();
