"use client";

import React, { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FiFilter, FiX, FiSearch, FiShoppingCart } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import apiClient from '@/lib/apiClient';
import { useCart } from '@/context/CartContext';
import Notification from '@/components/ui/Notification';

// Интерфейс для продукта
interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  composition: string;
  category: string;
  stock: number;
  articleNumber: string;
  description?: string;
  slug?: string;
}

const CatalogContent: React.FC = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const { addItem, isLoading: isCartLoading } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [inStock, setInStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'info' });

  // Категории тканей (динамически из базы)
  interface Category {
    _id: string;
    name: string;
    slug: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  // Загрузка товаров из API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let apiUrl = 'products';
        
        // Если выбрана категория, добавляем её в запрос
        if (categoryParam && categoryParam !== 'all') {
          apiUrl += `?category=${categoryParam}`;
        }
        
        // Если есть поисковый запрос, добавляем его
        if (searchQuery) {
          apiUrl += `${categoryParam !== 'all' ? '&' : '?'}search=${searchQuery}`;
        }
        
        const response = await apiClient.get(apiUrl);
        
        if (response.success && response.data) {
          setProducts(response.data);
          setFilteredProducts(response.data);
        } else {
          setError('Не удалось загрузить товары');
        }
      } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        setError('Ошибка при загрузке товаров');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoryParam, searchQuery]);

  // Применение фильтров
  useEffect(() => {
    let filtered = [...products];

    // Фильтрация по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Фильтрация по цене
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Фильтрация по наличию на складе
    if (inStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Фильтрация по поисковому запросу
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, priceRange, inStock, searchTerm]);

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

  // Обработчики событий
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePriceChange = (value: number, type: 'min' | 'max') => {
    if (type === 'min') {
      setPriceRange([value, priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], value]);
    }
  };
  
  const handleInStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInStock(e.target.checked);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск выполняется через useEffect
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  // Добавление товара в корзину
  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(product._id);
      await addItem(product._id, 1);
      setAddingToCart(null);
      
      // Показываем уведомление об успешном добавлении
      setNotification({
        show: true,
        message: `Товар "${product.name}" добавлен в корзину!`,
        type: 'success'
      });
      
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (err) {
      console.error('Ошибка при добавлении товара в корзину:', err);
      setAddingToCart(null);
      
      setNotification({
        show: true,
        message: 'Не удалось добавить товар в корзину. Пожалуйста, попробуйте снова.',
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="page-title text-3xl font-bold mb-8">Каталог тканей</h1>

      {/* Поиск */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="flex">
          <input
            type="text"
            placeholder="Поиск по названию или артикулу..."
            className="form-input w-full md:w-1/2 p-3 rounded-l-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="btn px-4 rounded-r-md hover:bg-primary-hover flex items-center justify-center"
          >
            <FiSearch className="mr-2" /> Поиск
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Фильтры - мобильная версия */}
        <button
          className="md:hidden btn px-4 py-3 flex items-center justify-center gap-2"
          onClick={toggleFilters}
        >
          {isFilterOpen ? (
            <>
              <FiX /> Скрыть фильтры
            </>
          ) : (
            <>
              <FiFilter /> Показать фильтры
            </>
          )}
        </button>

        {/* Фильтры */}
        <div
          className={`${
            isFilterOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-white rounded-md p-4 shadow-sm sticky top-24 h-fit`}
        >
          <h2 className="text-xl font-semibold mb-4">Фильтры</h2>

          {/* Категории */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Категории</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="category-all"
                  name="category"
                  checked={selectedCategory === 'all'}
                  onChange={() => handleCategoryChange('all')}
                  className="form-radio text-pink-500"
                />
                <label
                  htmlFor="category-all"
                  className={`ml-2 cursor-pointer ${selectedCategory === 'all' ? 'text-pink-600 font-bold' : ''}`}
                >
                  Все категории
                </label>
              </div>
              {catLoading ? (
                <div className="text-gray-400 ml-2">Загрузка...</div>
              ) : catError ? (
                <div className="text-red-400 ml-2">{catError}</div>
              ) : (
                categories.map((cat) => (
                  <div key={cat._id} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${cat.slug}`}
                      name="category"
                      checked={selectedCategory === cat.slug}
                      onChange={() => handleCategoryChange(cat.slug)}
                      className="form-radio text-pink-500"
                    />
                    <label
                      htmlFor={`category-${cat.slug}`}
                      className={`ml-2 cursor-pointer ${selectedCategory === cat.slug ? 'text-pink-600 font-bold' : ''}`}
                    >
                      {cat.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Диапазон цен */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Цена</h3>
            <div className={`flex items-center gap-2 ${priceRange[0] > 0 || priceRange[1] < 3000 ? 'bg-pink-50 rounded px-2 py-1' : ''}`}>
              <input
                type="number"
                min={0}
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={e => handlePriceChange(Number(e.target.value), 'min')}
                className="form-input w-20"
              />
              <span>–</span>
              <input
                type="number"
                min={priceRange[0]}
                max={3000}
                value={priceRange[1]}
                onChange={e => handlePriceChange(Number(e.target.value), 'max')}
                className="form-input w-20"
              />
              <span>₽</span>
            </div>
          </div>
          {/* В наличии */}
          <div className="mb-6">
            <label className={`flex items-center cursor-pointer ${inStock ? 'text-pink-600 font-bold' : ''}`}>
              <input
                type="checkbox"
                checked={inStock}
                onChange={handleInStockChange}
                className="form-checkbox text-pink-500"
              />
              <span className="ml-2">Только в наличии</span>
            </label>
          </div>
          {/* Поиск */}
          <div className="mb-6">
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                type="text"
                placeholder="Поиск по названию или артикулу..."
                className={`form-input w-full md:w-1/2 p-3 rounded-l-md ${searchTerm ? 'border-pink-400 ring-2 ring-pink-200' : ''}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="btn rounded-r-md"
              >
                Найти
              </button>
            </form>
          </div>
        </div>

        {/* Товары */}
        <div className="flex-1">
          {/* Активные фильтры */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                Категория: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                <button
                  className="ml-2 text-pink-500 hover:text-pink-700"
                  onClick={() => setSelectedCategory('all')}
                  title="Сбросить категорию"
                >×</button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 3000) && (
              <span className="inline-flex items-center bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                Цена: {priceRange[0]}–{priceRange[1]} ₽
                <button
                  className="ml-2 text-pink-500 hover:text-pink-700"
                  onClick={() => setPriceRange([0, 3000])}
                  title="Сбросить цену"
                >×</button>
              </span>
            )}
            {inStock && (
              <span className="inline-flex items-center bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                Только в наличии
                <button
                  className="ml-2 text-pink-500 hover:text-pink-700"
                  onClick={() => setInStock(false)}
                  title="Сбросить фильтр наличия"
                >×</button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                Поиск: {searchTerm}
                <button
                  className="ml-2 text-pink-500 hover:text-pink-700"
                  onClick={() => setSearchTerm('')}
                  title="Сбросить поиск"
                >×</button>
              </span>
            )}
            {(selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 3000 || inStock || searchTerm) && (
              <button
                className="ml-2 text-xs text-gray-500 underline hover:text-pink-600"
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange([0, 3000]);
                  setInStock(false);
                  setSearchTerm('');
                }}
              >Сбросить все</button>
            )}
          </div>

          {/* Результаты поиска */}
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : 
                filteredProducts.length > 1 && filteredProducts.length < 5 ? 'товара' : 'товаров'}
            </h2>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="notification notification-error rounded-md p-4 mb-4">
              {error}
            </div>
          )}

          {/* Индикатор загрузки */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4 text-6xl">😔</div>
              <h3 className="text-xl font-semibold mb-2">Товары не найдены</h3>
              <p className="text-gray-600 mb-4">
                Попробуйте изменить параметры фильтрации или поиска
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange([0, 3000]);
                  setInStock(false);
                  setSearchTerm('');
                }}
                className="btn-secondary px-4 py-2 rounded"
              >
                Сбросить все фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <Link href={`/product/${product._id}`}>
                    <div className="h-64 bg-gray-200 relative">
                      {product.images && product.images.length > 0 ? (
                        <Image 
                          src={product.images[0]} 
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          Нет изображения
                        </div>
                      )}
                      {/* Декоративная корона на премиальных товарах (если цена > 1500) */}
                      {product.price > 1500 && (
                        <div className="absolute top-3 right-3 text-amber-500 text-sm">
                          <FaCrown />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium hover:text-pink-600 transition">{product.name}</h3>
                        <span className="text-xs text-gray-500">{product.articleNumber}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.composition}</p>
                      <div className="flex justify-between items-center">
                        <p className="product-price">{product.price} ₽/м</p>
                        <span className={`text-sm ${product.stock > 0 ? 'text-pink-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? 'В наличии' : 'Нет в наличии'}
                        </span>
                      </div>
                      <button 
                        className="w-full mt-3 btn-secondary py-1 px-2 rounded flex items-center justify-center gap-1 text-sm"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent link navigation
                          handleAddToCart(product);
                        }}
                        disabled={addingToCart === product._id || isCartLoading || product.stock <= 0}
                      >
                        {addingToCart === product._id ? (
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
          )}
        </div>
      </div>
      
      {/* Уведомление */}
      {notification.show && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

const Catalog: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-8 text-center">Загрузка каталога...</div>}>
      <CatalogContent />
    </Suspense>
  );
};

export default Catalog;
