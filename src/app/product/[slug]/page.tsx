"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import apiClient from '@/lib/apiClient';
import Notification from '@/components/ui/Notification';
import { useSession } from 'next-auth/react';
import ProductEditForm from '@/components/ProductEditForm';
import ProductImage from '@/components/ui/ProductImage';
import { getFirstImage, getImageUrl } from '@/lib/imageUtils';

// Получение похожих товаров из той же категории
const getSimilarProducts = async (category: string, currentId: string) => {
  try {
    const response = await apiClient.get(`products?category=${category}`);
    if (response.success && response.data) {
      return response.data
        .filter((p: Product) => p._id !== currentId)
        .slice(0, 4);
    }
    return [];
  } catch (error) {
    console.error('Ошибка при получении похожих товаров:', error);
    return [];
  }
};

// Определение типов для продукта
interface Product {
  _id: string;
  name: string;
  articleNumber: string;
  description: string;
  price: number;
  composition: string;
  category: string;
  stock: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
  slug?: string; // Для некоторых продуктов может быть определен slug
}

export default function ProductPage() {
  const params = useParams();

  const slug = params.slug as string;
    const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0.1); // Начинаем с 10см
  const [selectedImage, setSelectedImage] = useState(0);

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'info' });
  const [addingSimilarProductId, setAddingSimilarProductId] = useState<string | null>(null);
  const { addItem } = useCart();
  const { data: session } = useSession();
  const [showEdit, setShowEdit] = useState(false);
  interface Category {
    _id: string;
    name: string;
    slug: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);

  // Загрузка данных о товаре
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Загрузка товара: ${slug}`);
        console.log(`🔍 Полный URL запроса: /api/products/${slug}`);
        
        // Основной запрос к API
        const response = await apiClient.get(`products/${slug}`);
        
        console.log('📦 Ответ API:', response);
        console.log('📦 Success:', response.success);
        console.log('📦 Data:', response.data);
        console.log('📦 Message:', response.message);
        
        if (response.success && response.data) {
          console.log(`✅ Товар найден: ${response.data.name}`);
          setProduct(response.data);
          
          // Загружаем похожие товары из той же категории
          try {
            const similar = await getSimilarProducts(response.data.category, response.data._id);
            setSimilarProducts(similar);
            console.log(`🔗 Загружено ${similar.length} похожих товаров`);
          } catch (similarError) {
            console.warn('⚠️ Ошибка при загрузке похожих товаров:', similarError);
            setSimilarProducts([]);
          }
          
          setError(null);
        } else {
          console.log(`❌ Товар не найден в API: ${slug}`);
          console.log('📝 Ответ сервера:', response);
          setError(response.message || 'Товар не найден');
          setProduct(null);
        }
      } catch (error) {
        console.error('❌ Ошибка при загрузке товара:', error);
        setError('Не удалось загрузить информацию о товаре. Проверьте подключение к интернету.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Загрузка категорий для формы редактирования
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };
    fetchCategories();
  }, []);

  const decreaseQuantity = () => {
    if (quantity > 0.1) {
      setQuantity(Math.round((quantity - 0.1) * 10) / 10); // Уменьшаем на 10см с округлением
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(Math.round((quantity + 0.1) * 10) / 10); // Увеличиваем на 10см с округлением
    }
  };
    const addToCart = async () => {
    try {
      if (!product) return;
      
      // Вызываем функцию из контекста корзины для добавления товара
      console.log('Добавление товара в корзину:', { 
        id: product._id, 
        name: product.name, 
        articleNumber: product.articleNumber,
        quantity 
      });
      
      // Предпочтительно используем артикул товара для поиска в БД
      const productIdentifier = product.articleNumber || product._id;
      
      console.log('Идентификатор товара для добавления в корзину:', productIdentifier);
      await addItem(productIdentifier, quantity);
      
      console.log(`Добавлено в корзину: ${product.name}, количество: ${quantity}`);
      
      // Показываем уведомление об успешном добавлении
      setNotification({
        show: true,
        message: `Товар "${product.name}" (${quantity}м) добавлен в корзину!`,
        type: 'success'
      });
      
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Ошибка при добавлении товара в корзину:', error);
      
      setNotification({
        show: true,
        message: 'Не удалось добавить товар в корзину. Пожалуйста, попробуйте снова.',
        type: 'error'
      });
    }
  };

  
  // Обработчик для добавления похожего товара в корзину
  const addSimilarProductToCart = async (product: Product) => {
    try {
      setAddingSimilarProductId(product._id);
      
      // Предпочтительно используем артикул товара для поиска в БД
      const productIdentifier = product.articleNumber || product._id;
      
      await addItem(productIdentifier, 0.1); // Добавляем 10см
      
      setNotification({
        show: true,
        message: `Товар "${product.name}" добавлен в корзину!`,
        type: 'success'
      });
      
      setTimeout(() => {
        setAddingSimilarProductId(null);
        setNotification(prev => ({ ...prev, show: false }));
      }, 2000);
    } catch (error) {
      console.error('Ошибка при добавлении товара в корзину:', error);
      
      setNotification({
        show: true,
        message: 'Не удалось добавить товар в корзину',
        type: 'error'
      });
      
      setAddingSimilarProductId(null);
    }
  };

  // Определяем, является ли товар премиальным (цена > 1500)
  // Если товар загружается, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  // Если товар не найден или произошла ошибка
  if (!product || error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="page-title text-2xl font-bold mb-4">Товар не найден</h1>
        <p className="mb-8">{error || 'К сожалению, запрашиваемый товар не существует или был удален.'}</p>
        <Link 
          href="/catalog" 
          className="btn px-6 py-3 rounded-full font-medium"
        >
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const isPremium = product.price > 1500;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Хлебные крошки */}
      <nav className="text-sm mb-8">
        <ol className="flex flex-wrap items-center">
          <li className="flex items-center">
            <Link href="/" className="text-gray-500 hover:text-pink-500 transition">
              Главная
            </Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="flex items-center">
            <Link href="/catalog" className="text-gray-500 hover:text-pink-500 transition">
              Каталог
            </Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="flex items-center">
            <Link 
              href={`/catalog?category=${product.category}`} 
              className="text-gray-500 hover:text-pink-500 transition"
            >
              {product.category}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="text-pink-500 font-medium truncate">{product.name}</li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row -mx-4">        {/* Галерея изображений */}
        <div className="md:w-1/2 px-4 mb-8 md:mb-0">
          <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden relative aspect-square">
            {product.images && product.images.length > 0 ? (
              <ProductImage 
                src={getImageUrl(product.images[selectedImage], '/vercel.svg')} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                Нет изображения
              </div>
            )}
            
            {/* Бейдж премиальности */}
            {isPremium && (
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center">
                <FaCrown className="text-amber-500 mr-1" size={14} />
                <span className="text-xs font-medium">Премиум</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <button
                  key={index}
                  className={`aspect-square bg-gray-100 rounded-md overflow-hidden relative ${
                    selectedImage === index ? 'ring-2 ring-pink-500' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <ProductImage 
                    src={getImageUrl(image, '/vercel.svg')} 
                    alt={`${product.name} - изображение ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))
            ) : (
              <div className="col-span-4 text-center text-gray-500 p-2">
                Дополнительных изображений нет
              </div>
            )}
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="md:w-1/2 px-4">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-title)' }}>{product.name}</h1>
          <p className="text-gray-500 mb-4">Артикул: {product.articleNumber}</p>
          
          <div className="text-2xl font-bold text-pink-600 mb-6">
            {Math.round(product.price / 10)} ₽/10см
            <span className="text-sm text-gray-500 block">({product.price} ₽/м)</span>
          </div>

          <div className="mb-6 decorated-container p-4">
            <h2 className="font-semibold mb-2 text-pink-600">Описание</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold mb-3 text-pink-600">Характеристики</h2>
            <ul className="space-y-2 divide-y divide-pink-100">
              <li className="flex pt-2">
                <span className="w-32 text-gray-600">Состав:</span>
                <span className="text-gray-900">{product.composition}</span>
              </li>
              <li className="flex pt-2">
                <span className="w-32 text-gray-600">Категория:</span>
                <span className="text-gray-900">{product.category}</span>
              </li>
              <li className="flex pt-2">
                <span className="w-32 text-gray-600">Наличие:</span>
                <span className={`${product.stock > 0 ? 'text-pink-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `В наличии (${product.stock} м)` : 'Нет в наличии'}
                </span>
              </li>
            </ul>
          </div>

          {/* Количество и добавление в корзину */}
          {product.stock > 0 ? (
            <div className="mb-6">
              <h2 className="font-semibold mb-3 text-pink-600">Количество</h2>
              <div className="flex items-center">
                <button
                  onClick={decreaseQuantity}
                  className="flex items-center justify-center w-10 h-10 rounded-l border border-pink-200 bg-pink-50 text-gray-600 hover:bg-pink-100 transition"
                  disabled={quantity <= 0.1}
                >
                  <FiMinus />
                </button>
                <input
                  type="number"
                  step="0.1"
                  className="w-20 h-10 border-y border-pink-200 text-center text-gray-700 focus:outline-none"
                  value={quantity.toFixed(1)}
                  min="0.1"
                  max={product.stock}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0.1 && val <= product.stock) {
                      setQuantity(Math.round(val * 10) / 10); // Округляем до 0.1
                    }
                  }}
                />
                <button
                  onClick={increaseQuantity}
                  className="flex items-center justify-center w-10 h-10 rounded-r border border-pink-200 bg-pink-50 text-gray-600 hover:bg-pink-100 transition"
                  disabled={quantity >= product.stock}
                >
                  <FiPlus />
                </button>
                <div className="ml-4 text-gray-700">
                  <div className="font-medium">{quantity}м ({Math.round(quantity * 100)}см)</div>
                  <div className="text-sm">Сумма: {(product.price * quantity).toLocaleString()} ₽</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-red-600 font-medium">
              Товар временно отсутствует
            </div>
          )}          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className={`btn flex items-center justify-center w-full py-3 px-6 rounded-full text-white font-medium transition ${
              product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : ''
            }`}
          >            <FiShoppingCart className="mr-2" />
            Добавить в корзину
          </button>
          
          {/* Уведомление */}
          {notification.show && (
            <Notification 
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
          )}

          {session?.user?.role === 'admin' && product && (
            <div className="mb-4 flex justify-end">
              <button className="btn px-4 py-2" onClick={() => setShowEdit(true)}>
                Редактировать
              </button>
            </div>
          )}
        </div>
      </div>{/* Похожие товары */}
      {similarProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title text-2xl font-bold mb-8">С этим товаром покупают</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <div key={product._id} className="product-card">
                <Link href={`/product/${product._id}`}>
                  <div className="h-48 bg-gray-200 relative">
                    {product.images && product.images.length > 0 ? (
                      <ProductImage 
                        src={getFirstImage(product.images, '/vercel.svg')} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Нет изображения
                      </div>
                    )}
                    {product.price > 1500 && (
                      <div className="absolute top-3 right-3 text-amber-500 text-sm">
                        <FaCrown />
                      </div>
                    )}
                  </div>                  <div className="p-4">
                    <h3 className="font-medium mb-2 hover:text-pink-600 transition">{product.name}</h3>
                    <p className="product-price mb-2">{Math.round(product.price / 10)} ₽/10см</p>
                    <button 
                      className="w-full btn-secondary py-1 px-2 rounded flex items-center justify-center gap-1 text-sm"
                      onClick={(e) => {
                        e.preventDefault(); // Предотвращаем переход по ссылке
                        addSimilarProductToCart(product);
                      }}
                      disabled={addingSimilarProductId === product._id}
                    >
                      {addingSimilarProductId === product._id ? (
                        'Добавление...'
                      ) : (
                        <>
                          <FiShoppingCart size={14} /> В корзину
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {showEdit && product && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowEdit(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">Редактировать товар</h3>
            <ProductEditForm
              product={product}
              categories={categories}
              onSave={(updated) => { setProduct(updated); setShowEdit(false); }}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
