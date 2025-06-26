"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiShoppingBag, FiAlertTriangle } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { getImageUrl } from '@/lib/imageUtils';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const router = useRouter();
  const { cart, isLoading, error, updateItem, removeItem, totalAmount } = useCart();
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // Изменение количества товара
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.items.find(item => item.productId === productId);
    
    if (!item) return;
    
    // Проверка на наличие и минимальное значение
    if (newQuantity < 1 || (item.stock && newQuantity > item.stock)) return;
    
    updateItem(productId, newQuantity);
  };

  // Удаление товара из корзины
  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  // Переход к оформлению заказа
  const proceedToCheckout = () => {
    setProcessingCheckout(true);
    router.push('/checkout');
  };

  // Если корзина пуста
  if (!isLoading && cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FiShoppingBag className="mx-auto text-pink-300 mb-4" size={64} />
        <h1 className="page-title text-2xl font-bold mb-4">Ваша корзина пуста</h1>
        <p className="text-gray-600 mb-8">Добавьте товары в корзину, чтобы продолжить покупки.</p>
        <Link 
          href="/catalog" 
          className="btn px-6 py-3 rounded-full font-medium"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="page-title text-3xl font-bold mb-8">Корзина</h1>
      
      {error && (
        <div className="notification notification-error p-4 mb-6 flex items-start">
          <FiAlertTriangle className="mt-1 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Список товаров */}
          <div className="w-full lg:w-2/3">
            <div className="decorated-container bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-pink-100">
                <h2 className="text-xl font-semibold text-pink-600">Товары в корзине ({cart.items.length})</h2>
              </div>
              
              <ul className="divide-y divide-pink-100">
                {cart.items.map((item, index) => {
                  // Уникальный строковый ключ
                  const key = `${item.productId || 'noid'}-${item.slug || index}`;
                  // Для href используем только строку
                  const href = (item.slug && typeof item.slug === 'string')
                    ? `/product/${item.slug}`
                    : (item.productId && typeof item.productId === 'string')
                      ? `/product/${item.productId}`
                      : undefined;
                  return (
                    <li key={key} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-center">
                        {/* Изображение товара */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-md flex-shrink-0 mr-0 sm:mr-6 mb-4 sm:mb-0 relative overflow-hidden">
                          {item.image && typeof item.image === 'string' && item.image.trim() !== '' ? (
                            <Image
                              src={getImageUrl(item.image)}
                              alt={item.name || 'Товар'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 96px, 128px"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400">
                              <FiShoppingBag size={40} />
                            </div>
                          )}
                          {/* Премиальный товар (для примера, если цена > 1500) */}
                          {(item.price || 0) > 1500 && (
                            <div className="absolute top-2 right-2 text-amber-500 text-sm">
                              <FaCrown />
                            </div>
                          )}
                        </div>
                        
                        {/* Информация о товаре */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between mb-4">
                            <div>
                              {href ? (
                                <Link 
                                  href={href}
                                  className="text-lg font-medium hover:text-pink-600 transition"
                                >
                                  {item.name || `Товар #${item.productId}`}
                                </Link>
                              ) : (
                                <span className="text-lg font-medium">{item.name || `Товар #${item.productId}`}</span>
                              )}
                              <p className="text-gray-600">Цена: {item.price} ₽/м</p>
                            </div>
                            <div className="mt-2 sm:mt-0 text-right">
                              <p className="product-price text-lg">
                                {((item.price || 0) * item.quantity).toLocaleString()} ₽
                              </p>
                            </div>
                          </div>
                          
                          {/* Управление количеством и удаление */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <button
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                className="flex items-center justify-center w-8 h-8 rounded-l border border-pink-200 bg-pink-50 text-gray-600 hover:bg-pink-100 transition"
                                disabled={item.quantity <= 1 || isLoading}
                              >
                                <FiMinus size={16} />
                              </button>
                              <input
                                type="number"
                                className="w-12 h-8 border-y border-pink-200 text-center text-gray-700 focus:outline-none"
                                value={item.quantity}
                                min="1"
                                max={item.stock}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) {
                                    handleUpdateQuantity(item.productId, val);
                                  }
                                }}
                                disabled={isLoading}
                              />
                              <button
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                className="flex items-center justify-center w-8 h-8 rounded-r border border-pink-200 bg-pink-50 text-gray-600 hover:bg-pink-100 transition"
                                disabled={(item.stock !== undefined && item.quantity >= item.stock) || isLoading}
                              >
                                <FiPlus size={16} />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="flex items-center text-red-500 hover:text-red-700 transition"
                              disabled={isLoading}
                            >
                              <FiTrash2 size={16} className="mr-1" />
                              <span>Удалить</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div className="mt-6">
              <Link
                href="/catalog"
                className="inline-flex items-center text-pink-600 hover:text-pink-700 transition"
              >
                <FiArrowLeft className="mr-2" />
                Продолжить покупки
              </Link>
            </div>
          </div>
          
          {/* Сводка заказа */}
          <div className="w-full lg:w-1/3">
            <div className="decorated-container bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
              <div className="p-4 border-b border-pink-100">
                <h2 className="text-xl font-semibold text-pink-600">Сводка заказа</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Стоимость товаров:</span>
                    <span>{totalAmount.toLocaleString()} ₽</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Итого к оплате:</span>
                    <span className="product-price">{totalAmount.toLocaleString()} ₽</span>
                  </div>
                </div>
                
                <button
                  onClick={proceedToCheckout}
                  disabled={isLoading || processingCheckout || cart.items.length === 0}
                  className="btn w-full mt-6 py-3 px-4 rounded-md font-medium transition flex items-center justify-center disabled:bg-gray-400"
                >
                  {isLoading || processingCheckout ? (
                    <span>Обработка...</span>
                  ) : (
                    <span>Оформить заказ</span>
                  )}
                </button>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    Оформляя заказ, вы соглашаетесь с нашими{' '}
                    <Link href="/terms" className="text-pink-600 hover:underline">
                      условиями использования
                    </Link>{' '}
                    и{' '}
                    <Link href="/privacy" className="text-pink-600 hover:underline">
                      политикой конфиденциальности
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
