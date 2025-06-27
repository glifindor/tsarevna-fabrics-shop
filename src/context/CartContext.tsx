"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/apiClient';
import { logger } from '@/lib/logger';

// Типы для элементов корзины
export interface CartItem {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
  slug?: string;
  stock?: number;
}

export interface Cart {
  _id?: string;
  userId?: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Тип контекста корзины
interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
}

// Создаем контекст для корзины
const CartContext = createContext<CartContextType | undefined>(undefined);

// Провайдер корзины
export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Вычисляемые свойства
  const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.items.reduce((total, item) => {
    return total + (item.price || 0) * item.quantity;
  }, 0);
  
  // Загрузка корзины при авторизации
  useEffect(() => {
    // Только для авторизованных пользователей загружаем корзину с сервера
    if (status === 'authenticated') {
      fetchCart();
    } else if (status === 'unauthenticated') {
      // Для неавторизованных пользователей используем пустую корзину
      setCart({ items: [] });
      // Очищаем localStorage от старых данных корзины
      localStorage.removeItem('cart');
    }
  }, [status]);

  // Получение корзины с сервера
  const fetchCart = async () => {
    if (status !== 'authenticated') return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      logger.log('Запрос корзины с сервера');
      const response = await apiClient.get('/cart');
      logger.log('Ответ сервера (GET /cart):', response);
      
      if (response.success && response.data) {
        // Преобразование данных для правильного отображения
        const cartData = response.data;
        logger.log('Данные корзины с сервера:', cartData);
        
        const formattedCart = {
          ...cartData,
          items: cartData.items
            .filter((item: any) => {
              let pid = item.productId;
              if (pid && typeof pid === 'object' && pid._id) pid = pid._id;
              return pid && typeof pid === 'string' && pid.trim() !== '';
            })
            .map((item: any) => {
              let pid = item.productId;
              if (pid && typeof pid === 'object' && pid._id) pid = pid._id;
              const productIdStr = String(pid);
              if (item.productId && typeof item.productId === 'object') {
                // populate
                return {
                  productId: productIdStr,
                  quantity: item.quantity,
                  name: item.productId.name || '',
                  price: item.productId.price || 0,
                  image: item.productId.images && item.productId.images.length > 0 ? item.productId.images[0] : '',
                  slug: item.productId.slug ? String(item.productId.slug) : (item.productId.articleNumber ? String(item.productId.articleNumber) : ''),
                  stock: item.productId.stock || 0,
                  articleNumber: item.productId.articleNumber || '',
                  description: item.productId.description || '',
                  composition: item.productId.composition || '',
                  category: item.productId.category || '',
                  images: item.productId.images || [],
                };
              }
              // обычный формат
              return {
                productId: productIdStr,
                quantity: item.quantity,
                name: item.name || '',
                price: item.price || 0,
                image: item.image || '',
                slug: item.slug ? String(item.slug) : '',
                stock: item.stock || 0,
                articleNumber: item.articleNumber || '',
                description: item.description || '',
                composition: item.composition || '',
                category: item.category || '',
                images: item.images || [],
              };
            })
        };
        
        logger.log('Отформатированные данные корзины:', formattedCart);
        setCart(formattedCart);
      } else {
        setError(response.message || 'Не удалось загрузить корзину');
        logger.error('Ошибка при загрузке корзины:', response);
      }
    } catch (error) {
      setError('Ошибка при загрузке корзины');
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Добавление товара в корзину
  const addItem = async (productId: string, quantity: number) => {
    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      setError('Некорректный ID товара. Добавление невозможно.');
      return;
    }

    // Проверяем авторизацию пользователя
    if (status !== 'authenticated') {
      setError('Для добавления товаров в корзину необходимо войти в систему');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Отправляем запрос на сервер для авторизованных пользователей
      logger.log('Отправка запроса на добавление товара', { productId, quantity });
      
      // Убедимся, что productId - это строка
      const productIdStr = productId.toString();
      
      // Добавляем дополнительные логи для отладки
      logger.log(`Тип productId: ${typeof productId}, значение: ${productId}`);
      logger.log(`Приведенное значение: ${productIdStr}`);
      
      // Сначала попробуем добавить через новый эндпоинт
      let response = await apiClient.post('/cart/add', { 
        productId: productIdStr, 
        quantity 
      });
      
      // Если не получилось, попробуем через стандартный эндпоинт
      if (!response.success) {
        logger.log('Пробуем добавить через стандартный эндпоинт');
        response = await apiClient.post('/cart', { 
          productId: productIdStr, 
          quantity 
        });
      }
      
      logger.log('Ответ сервера:', response);
      
      if (response.success && response.data) {
        // Преобразуем данные корзины для правильного отображения
        const cartData = response.data;
        logger.log('Данные корзины с сервера:', cartData);
        
        // Форматируем данные корзины для работы с ними
        const formattedCart = {
          ...cartData,
          items: cartData.items
            .filter((item: any) => {
              let pid = item.productId;
              if (pid && typeof pid === 'object' && pid._id) pid = pid._id;
              return pid && typeof pid === 'string' && pid.trim() !== '';
            })
            .map((item: any) => {
              let pid = item.productId;
              if (pid && typeof pid === 'object' && pid._id) pid = pid._id;
              const productIdStr = String(pid);
              if (item.productId && typeof item.productId === 'object') {
                // populate
                return {
                  productId: productIdStr,
                  quantity: item.quantity,
                  name: item.productId.name || '',
                  price: item.productId.price || 0,
                  image: item.productId.images && item.productId.images.length > 0 ? item.productId.images[0] : '',
                  slug: item.productId.slug ? String(item.productId.slug) : (item.productId.articleNumber ? String(item.productId.articleNumber) : ''),
                  stock: item.productId.stock || 0,
                  articleNumber: item.productId.articleNumber || '',
                  description: item.productId.description || '',
                  composition: item.productId.composition || '',
                  category: item.productId.category || '',
                  images: item.productId.images || [],
                };
              }
              // обычный формат
              return {
                productId: productIdStr,
                quantity: item.quantity,
                name: item.name || '',
                price: item.price || 0,
                image: item.image || '',
                slug: item.slug ? String(item.slug) : '',
                stock: item.stock || 0,
                articleNumber: item.articleNumber || '',
                description: item.description || '',
                composition: item.composition || '',
                category: item.category || '',
                images: item.images || [],
              };
            })
        };
        
        logger.log('Отформатированные данные корзины:', formattedCart);
        setCart(formattedCart);
      } else {
        setError(response.message || 'Не удалось добавить товар в корзину');
        logger.error('Ошибка при добавлении товара в корзину:', response);
      }
    } catch (error) {
      setError('Ошибка при добавлении товара в корзину');
      logger.error('Ошибка при добавлении товара в корзину:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обновление количества товара в корзине
  const updateItem = async (productId: string, quantity: number) => {
    // Проверяем авторизацию пользователя
    if (status !== 'authenticated') {
      setError('Для изменения корзины необходимо войти в систему');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Логируем что отправляем
      logger.log('updateItem: Отправка запроса', { 
        productId, 
        quantity, 
        productIdType: typeof productId,
        productIdLength: productId?.length 
      });
      
      // Отправляем запрос на сервер для авторизованных пользователей
      const response = await apiClient.post('/cart', { productId, quantity });
      
      if (response.success && response.data) {
        // Форматируем данные корзины, как в fetchCart
        const cartData = response.data;
        const formattedCart = {
          ...cartData,
          items: cartData.items
            .filter((item: any) => {
              let pid = item.productId;
              if (pid && typeof pid === 'object' && pid._id) pid = pid._id;
              return pid && typeof pid === 'string' && pid.trim() !== '';
            })
            .map((item: any) => {
              let pid = item.productId;
              if (pid && typeof pid === 'object' && pid._id) pid = pid._id;
              const productIdStr = String(pid);
              if (item.productId && typeof item.productId === 'object') {
                // populate
                return {
                  productId: productIdStr,
                  quantity: item.quantity,
                  name: item.productId.name || '',
                  price: item.productId.price || 0,
                  image: item.productId.images && item.productId.images.length > 0 ? item.productId.images[0] : '',
                  slug: item.productId.slug ? String(item.productId.slug) : (item.productId.articleNumber ? String(item.productId.articleNumber) : ''),
                  stock: item.productId.stock || 0,
                  articleNumber: item.productId.articleNumber || '',
                  description: item.productId.description || '',
                  composition: item.productId.composition || '',
                  category: item.productId.category || '',
                  images: item.productId.images || [],
                };
              }
              // обычный формат
              return {
                productId: productIdStr,
                quantity: item.quantity,
                name: item.name || '',
                price: item.price || 0,
                image: item.image || '',
                slug: item.slug ? String(item.slug) : '',
                stock: item.stock || 0,
                articleNumber: item.articleNumber || '',
                description: item.description || '',
                composition: item.composition || '',
                category: item.category || '',
                images: item.images || [],
              };
            })
        };
        setCart(formattedCart);
      } else {
        setError(response.message || 'Не удалось обновить товар в корзине');
      }
    } catch (error) {
      setError('Ошибка при обновлении количества товара');
      logger.error('Ошибка при обновлении количества товара:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление товара из корзины
  const removeItem = async (productId: string) => {
    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      setError('Некорректный ID товара. Удаление невозможно.');
      return;
    }

    // Проверяем авторизацию пользователя
    if (status !== 'authenticated') {
      setError('Для изменения корзины необходимо войти в систему');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Для авторизованных пользователей удаляем товар через API
      logger.log('Отправка запроса на удаление товара из корзины', { productId });
      
      // Вызываем новый эндпоинт для удаления товара
      const response = await apiClient.post('/cart/remove', { productId });
      
      if (response.success && response.data) {
        const formattedCart = {
          ...response.data,
          items: response.data.items
            .filter((item: any) => {
              let pid = item.productId;
              if (pid && typeof pid === 'object' && pid._id) pid = pid._id;
              return pid && typeof pid === 'string' && pid.trim() !== '';
            })
            .map((item: any) => {
              let pid = item.productId;
              if (pid && typeof pid === 'object' && pid._id) pid = pid._id;
              const productIdStr = String(pid);
              if (item.productId && typeof item.productId === 'object') {
                // populate
                return {
                  productId: productIdStr,
                  quantity: item.quantity,
                  name: item.productId.name || '',
                  price: item.productId.price || 0,
                  image: item.productId.images && item.productId.images.length > 0 ? item.productId.images[0] : '',
                  slug: item.productId.slug ? String(item.productId.slug) : (item.productId.articleNumber ? String(item.productId.articleNumber) : ''),
                  stock: item.productId.stock || 0,
                  articleNumber: item.productId.articleNumber || '',
                  description: item.productId.description || '',
                  composition: item.productId.composition || '',
                  category: item.category || '',
                  images: item.images || [],
                };
              }
              // обычный формат
              return {
                productId: productIdStr,
                quantity: item.quantity,
                name: item.name || '',
                price: item.price || 0,
                image: item.image || '',
                slug: item.slug ? String(item.slug) : '',
                stock: item.stock || 0,
                articleNumber: item.articleNumber || '',
                description: item.description || '',
                composition: item.composition || '',
                category: item.category || '',
                images: item.images || [],
              };
            })
        };
        
        setCart(formattedCart);
      } else {
        setError(response.message || 'Не удалось удалить товар из корзины');
      }
    } catch (error) {
      setError('Ошибка при удалении товара из корзины');
      logger.error('Ошибка при удалении товара из корзины:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Очистка корзины
  const clearCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (status === 'authenticated') {
        // Для авторизованных пользователей очищаем корзину на сервере
        try {
          const response = await apiClient.delete('/cart');
          if (response.success) {
            setCart({ items: [] });
          } else {
            // Даже если сервер не ответил success, очищаем локально
            setCart({ items: [] });
          }
        } catch (error) {
          // Если сервер не отвечает, всё равно очищаем локально
          logger.error('Ошибка при очистке корзины на сервере:', error);
          setCart({ items: [] });
        }
      } else {
        // Для неавторизованных пользователей очищаем локальную корзину
        setCart({ items: [] });
      }
      
      // В любом случае удаляем localStorage
      localStorage.removeItem('cart');
    } catch (error) {
      // Не показываем ошибку пользователю, просто логируем
      logger.error('Ошибка при очистке корзины', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    cart,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    totalItems,
    totalAmount
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Хук для использования контекста корзины
export function useCart() {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
}
