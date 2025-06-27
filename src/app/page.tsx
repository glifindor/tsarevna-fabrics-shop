'use client';
import Link from "next/link";
import { FaCrown, FaRulerHorizontal, FaShippingFast, FaCreditCard, FaMagic } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getImageUrl, getFirstImage } from '@/lib/imageUtils';
import SimpleImage from '@/components/ui/SimpleImage';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  slug?: string;
}

export default function Home() {
  // Динамические категории
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          setCatError(data.message || 'Ошибка при загрузке категорий');
        }
      } catch {
        setCatError('Ошибка при загрузке категорий');
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Популярные товары
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodError, setProdError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setProdLoading(true);
      try {
        // Получаем топ-товары по статистике
        const statsRes = await fetch('/api/orders?stats=1');
        
        if (!statsRes.ok) {
          // Если нет статистики, просто загружаем первые товары
          const fallbackRes = await fetch('/api/products?limit=4');
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (fallbackData.success && fallbackData.data) {
              setFeaturedProducts(fallbackData.data);
            }
          }
          return;
        }
        
        const statsData = await statsRes.json();
        if (statsData.success && statsData.data && statsData.data.topProducts && Array.isArray(statsData.data.topProducts)) {
          // Для каждого товара получаем подробную инфу, только если у него есть productId
          const validProducts = statsData.data.topProducts.filter((tp: any) => 
            tp && tp.productId && typeof tp.productId === 'string' && tp.productId.trim()
          );
          
          if (validProducts.length === 0) {
            setProdError('Нет данных о популярных товарах');
            return;
          }
          
          const prods = await Promise.all(
            validProducts.slice(0, 4).map(async (tp: { productId: string }) => {
              try {
                const prodRes = await fetch(`/api/products/${tp.productId.trim()}`);
                if (!prodRes.ok) return null;
                
                const prodData = await prodRes.json();
                return prodData.success && prodData.data ? prodData.data : null;
              } catch (error) {
                console.error('Ошибка загрузки товара:', tp.productId, error);
                return null;
              }
            })
          );
          
          const validProds = prods.filter(Boolean);
          if (validProds.length > 0) {
            setFeaturedProducts(validProds);
          } else {
            // Если не удалось загрузить ни одного товара, загружаем просто первые товары
            const fallbackRes = await fetch('/api/products?limit=4');
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              if (fallbackData.success && fallbackData.data) {
                setFeaturedProducts(fallbackData.data);
              } else {
                setProdError('Не удалось загрузить товары');
              }
            } else {
              setProdError('Не удалось загрузить товары');
            }
          }
        } else {
          // Если нет статистики, загружаем просто первые товары
          const fallbackRes = await fetch('/api/products?limit=4');
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (fallbackData.success && fallbackData.data) {
              setFeaturedProducts(fallbackData.data);
            } else {
              setProdError('Не удалось загрузить товары');
            }
          } else {
            setProdError('Не удалось загрузить товары');
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке популярных товаров:', error);
        setProdError('Ошибка при загрузке популярных товаров');
      } finally {
        setProdLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="container mx-auto px-4 py-4 lg:py-8">
      {/* Баннер с фоновым изображением */}
      <section className="relative h-64 md:h-80 lg:h-96 mb-8 lg:mb-16 rounded-lg lg:rounded-2xl overflow-hidden decorated-container" style={{boxShadow: '0 8px 32px 0 rgba(236,72,153,0.10)'}}>
        {/* Градиентный фон */}
        <div className="absolute inset-0 flex items-center" style={{background: 'linear-gradient(120deg, #fbcfe8 0%, #fffbe9 60%, #fbbf24 100%)'}}>
          {/* SVG-паттерн ткани */}
          <div className="banner-fabric-pattern"></div>
          {/* Световое пятно */}
          <div className="banner-blur-spot"></div>
          {/* Glassmorphism-слой с текстом и кнопкой */}
          <div className="glass-banner w-full text-center z-20 px-3 md:px-4 relative py-6 md:py-12 lg:py-20 fade-in" style={{background: 'rgba(255,255,255,0.10)', boxShadow: '0 4px 32px 0 rgba(251,191,36,0.08)'}}>
            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl mb-3 md:mb-4 font-bold drop-shadow-2xl" style={{fontFamily: 'var(--font-title)', background: 'linear-gradient(90deg, #ec4899 20%, #fbbf24 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px md:2px'}}>
              Царевна Швеяна
            </h1>
            <p className="text-sm md:text-xl lg:text-2xl xl:text-3xl mb-4 md:mb-6 lg:mb-10 font-light fade-in px-2" style={{animationDelay: '0.2s', color: '#a21caf'}}>
              Высококачественные ткани для вашего творчества
            </p>
            <Link 
              href="/catalog" 
              className="inline-flex items-center gap-1 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-lg text-sm md:text-base lg:text-lg transition mx-auto"
              style={{animationDelay: '0.4s'}}
            >
              <FaMagic className="text-amber-300 text-base md:text-xl mr-1 md:mr-2" /> Перейти в каталог
            </Link>
            {/* SVG-волна снизу */}
            <svg className="banner-wave hidden md:block" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fffbe9" fillOpacity="0.8" d="M0,40 C360,120 1080,0 1440,60 L1440,80 L0,80 Z"/></svg>
            {/* Блёстки - скрываем на мобильном */}
            <svg className="banner-sparkle hidden md:block" style={{top: '30%', left: '15%', width: '32px', height: '32px'}} viewBox="0 0 32 32"><circle cx="16" cy="16" r="6" fill="#fff8"/><circle cx="16" cy="16" r="2" fill="#fff"/></svg>
            <svg className="banner-sparkle hidden md:block" style={{top: '60%', left: '80%', width: '20px', height: '20px', animationDelay: '1.2s'}} viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" fill="#fff6"/><circle cx="10" cy="10" r="1.5" fill="#fff"/></svg>
            {/* Декоративные элементы - скрываем на мобильном */}
            <div className="absolute left-2 md:left-5 bottom-2 md:bottom-5 text-pink-200 opacity-50 text-lg md:text-3xl transform rotate-12 hidden md:block">✿</div>
            <div className="absolute right-2 md:right-5 bottom-8 md:bottom-20 text-pink-200 opacity-30 text-base md:text-2xl transform -rotate-15 hidden md:block">✿</div>
          </div>
        </div>
      </section>

      {/* Популярные категории */}
      <section className="mb-8 lg:mb-16">
        <h2 className="section-title text-xl md:text-2xl font-bold mb-4 md:mb-8">Популярные категории</h2>
        {catLoading ? (
          <div className="text-center py-4">Загрузка...</div>
        ) : catError ? (
          <div className="text-red-500 text-center py-4">{catError}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {categories.map((category) => (
              <Link 
                key={category._id} 
                href={`/catalog?category=${category.slug}`}
                className="group touch-target"
              >
                <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square relative hover-scale shadow-sm">
                  {category.image ? (
                    <SimpleImage
                      src={getImageUrl(category.image, '/vercel.svg')}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      fallback="/vercel.svg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 text-xs md:text-sm">Нет фото</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-600/30 to-pink-400/10 flex items-end transition-all duration-300">
                    <h3 className="text-white font-medium p-2 md:p-4 w-full text-center group-hover:text-amber-200 transition text-sm md:text-base">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Популярные товары */}
      <section className="mb-8 lg:mb-16">
        <h2 className="section-title text-xl md:text-2xl font-bold mb-4 md:mb-8">Популярные товары</h2>
        {prodLoading ? (
          <div className="text-center py-4">Загрузка...</div>
        ) : prodError ? (
          <div className="text-red-500 text-center py-4">{prodError}</div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-gray-500 text-center py-4">Нет популярных товаров</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <div key={product._id} className="product-card touch-target">
                <Link href={`/product/${product._id}`}>
                  <div className="h-48 md:h-64 bg-gray-200 relative">
                    {product.images && product.images.length > 0 ? (
                      <SimpleImage
                        src={getFirstImage(product.images, '/vercel.svg')}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        fallback="/vercel.svg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 text-xs md:text-sm">Нет фото</div>
                    )}
                    <div className="absolute top-2 md:top-3 right-2 md:right-3 text-amber-500 text-xs md:text-sm">
                      <FaCrown />
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-medium mb-2 hover:text-pink-600 transition text-sm md:text-base line-clamp-2">{product.name}</h3>
                    <p className="product-price text-sm md:text-base">{product.price} ₽/м</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-6 md:mt-8">
          <Link 
            href="/catalog" 
            className="btn btn-inline px-6 md:px-8 py-2 md:py-3 rounded-full font-medium inline-block mobile-full-width"
          >
            Смотреть все товары
          </Link>
        </div>
      </section>

      {/* Преимущества */}
      <section className="mb-8 lg:mb-16 decorated-container py-6 md:py-10">
        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-10 text-center page-title">Почему выбирают нас</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div className="text-center bg-white p-4 md:p-6 rounded-lg shadow-sm hover-scale">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <FaRulerHorizontal className="h-6 w-6 md:h-8 md:w-8 text-pink-600" />
            </div>
            <h3 className="font-bold mb-2 text-pink-600 text-sm md:text-base">Высокое качество</h3>
            <p className="text-gray-600 text-xs md:text-sm">Все ткани проходят тщательный отбор и проверку качества</p>
          </div>
          <div className="text-center bg-white p-4 md:p-6 rounded-lg shadow-sm hover-scale">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <FaShippingFast className="h-6 w-6 md:h-8 md:w-8 text-pink-600" />
            </div>
            <h3 className="font-bold mb-2 text-pink-600 text-sm md:text-base">Быстрая доставка</h3>
            <p className="text-gray-600 text-xs md:text-sm">Доставляем заказы по всей России в кратчайшие сроки</p>
          </div>
          <div className="text-center bg-white p-4 md:p-6 rounded-lg shadow-sm hover-scale">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <FaCreditCard className="h-6 w-6 md:h-8 md:w-8 text-pink-600" />
            </div>
            <h3 className="font-bold mb-2 text-pink-600 text-sm md:text-base">Удобная оплата</h3>
            <p className="text-gray-600 text-xs md:text-sm">Множество способов оплаты для вашего удобства</p>
          </div>
        </div>
      </section>
    </div>
  );
}
