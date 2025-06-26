'use client';
import Image from "next/image";
import Link from "next/link";
import { FaCrown, FaRulerHorizontal, FaShippingFast, FaCreditCard, FaMagic } from 'react-icons/fa';
import { useEffect, useState } from 'react';

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
        const statsData = await statsRes.json();
        if (statsData.success && statsData.data && statsData.data.topProducts) {
          // Для каждого товара получаем подробную инфу
          const prods = await Promise.all(
            statsData.data.topProducts.map(async (tp: { productId: string }) => {
              const prodRes = await fetch(`/api/products/${tp.productId}`);
              const prodData = await prodRes.json();
              return prodData.success && prodData.data ? prodData.data : null;
            })
          );
          setFeaturedProducts(prods.filter(Boolean));
        } else {
          setProdError('Не удалось получить популярные товары');
        }
      } catch {
        setProdError('Ошибка при загрузке популярных товаров');
      } finally {
        setProdLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Баннер с фоновым изображением */}
      <section className="relative h-96 mb-16 rounded-2xl overflow-hidden decorated-container" style={{boxShadow: '0 8px 32px 0 rgba(236,72,153,0.10)'}}>
        {/* Градиентный фон */}
        <div className="absolute inset-0 flex items-center" style={{background: 'linear-gradient(120deg, #fbcfe8 0%, #fffbe9 60%, #fbbf24 100%)'}}>
          {/* SVG-паттерн ткани */}
          <div className="banner-fabric-pattern"></div>
          {/* Световое пятно */}
          <div className="banner-blur-spot"></div>
          {/* Glassmorphism-слой с текстом и кнопкой */}
          <div className="glass-banner w-full text-center z-20 px-4 relative py-12 md:py-20 fade-in" style={{background: 'rgba(255,255,255,0.10)', boxShadow: '0 4px 32px 0 rgba(251,191,36,0.08)'}}>
            <h1 className="text-5xl md:text-6xl mb-4 font-bold drop-shadow-2xl" style={{fontFamily: 'var(--font-title)', background: 'linear-gradient(90deg, #ec4899 20%, #fbbf24 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '2px'}}>
              Царевна Швеяна
            </h1>
            <p className="text-2xl md:text-3xl mb-10 font-light fade-in" style={{animationDelay: '0.2s', color: '#a21caf'}}>
              Высококачественные ткани для вашего творчества
            </p>
            <Link 
              href="/catalog" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-pink-600 hover:bg-pink-700 shadow-lg text-lg transition mx-auto mt-6"
              style={{animationDelay: '0.4s'}}
            >
              <FaMagic className="text-amber-300 text-xl mr-2" /> Перейти в каталог
            </Link>
            {/* SVG-волна снизу */}
            <svg className="banner-wave" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fffbe9" fillOpacity="0.8" d="M0,40 C360,120 1080,0 1440,60 L1440,80 L0,80 Z"/></svg>
            {/* Блёстки */}
            <svg className="banner-sparkle" style={{top: '30%', left: '15%', width: '32px', height: '32px'}} viewBox="0 0 32 32"><circle cx="16" cy="16" r="6" fill="#fff8"/><circle cx="16" cy="16" r="2" fill="#fff"/></svg>
            <svg className="banner-sparkle" style={{top: '60%', left: '80%', width: '20px', height: '20px', animationDelay: '1.2s'}} viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" fill="#fff6"/><circle cx="10" cy="10" r="1.5" fill="#fff"/></svg>
            {/* Декоративные элементы */}
            <div className="absolute left-5 bottom-5 text-pink-200 opacity-50 text-3xl transform rotate-12">✿</div>
            <div className="absolute right-5 bottom-20 text-pink-200 opacity-30 text-2xl transform -rotate-15">✿</div>
          </div>
        </div>
      </section>

      {/* Популярные категории */}
      <section className="mb-16">
        <h2 className="section-title text-2xl font-bold mb-8">Популярные категории</h2>
        {catLoading ? (
          <div>Загрузка...</div>
        ) : catError ? (
          <div className="text-red-500">{catError}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category._id} 
                href={`/catalog?category=${category.slug}`}
                className="group"
              >
                <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square relative hover-scale shadow-sm">
                  {category.image ? (
                    <Image
                                              src={category.image && category.image.startsWith('http') ? category.image : `/uploads/${category.image ? category.image.replace(/^\/+/, '').replace(/^uploads\//, '') : 'placeholder.jpg'}`}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/vercel.svg'; // или любой другой placeholder
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">Нет фото</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-600/30 to-pink-400/10 flex items-end transition-all duration-300">
                    <h3 className="text-white font-medium p-4 w-full text-center group-hover:text-amber-200 transition">
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
      <section className="mb-16">
        <h2 className="section-title text-2xl font-bold mb-8">Популярные товары</h2>
        {prodLoading ? (
          <div>Загрузка...</div>
        ) : prodError ? (
          <div className="text-red-500">{prodError}</div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-gray-500">Нет популярных товаров</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <Link href={`/product/${product._id}`}>
                  <div className="h-64 bg-gray-200 relative">
                    {product.images && product.images.length > 0 ? (
                      <Image
                                                  src={product.images[0] && product.images[0].startsWith('http') ? product.images[0] : `/uploads/${product.images[0] ? product.images[0].replace(/^\/+/, '').replace(/^uploads\//, '') : 'placeholder.jpg'}`}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/vercel.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">Нет фото</div>
                    )}
                    <div className="absolute top-3 right-3 text-amber-500 text-sm">
                      <FaCrown />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2 hover:text-pink-600 transition">{product.name}</h3>
                    <p className="product-price">{product.price} ₽/м</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link 
            href="/catalog" 
            className="btn px-8 py-3 rounded-full font-medium inline-block"
          >
            Смотреть все товары
          </Link>
        </div>
      </section>

      {/* Преимущества */}
      <section className="mb-16 decorated-container py-10">
        <h2 className="text-2xl font-bold mb-10 text-center page-title">Почему выбирают нас</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center bg-white p-6 rounded-lg shadow-sm hover-scale">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRulerHorizontal className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="font-bold mb-2 text-pink-600">Высокое качество</h3>
            <p className="text-gray-600">Все ткани проходят тщательный отбор и проверку качества</p>
          </div>
          <div className="text-center bg-white p-6 rounded-lg shadow-sm hover-scale">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShippingFast className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="font-bold mb-2 text-pink-600">Быстрая доставка</h3>
            <p className="text-gray-600">Доставляем заказы по всей России в кратчайшие сроки</p>
          </div>
          <div className="text-center bg-white p-6 rounded-lg shadow-sm hover-scale">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="font-bold mb-2 text-pink-600">Удобная оплата</h3>
            <p className="text-gray-600">Множество способов оплаты для вашего удобства</p>
          </div>
        </div>
      </section>
    </div>
  );
}
