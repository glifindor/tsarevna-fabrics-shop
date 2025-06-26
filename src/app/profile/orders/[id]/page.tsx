"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiAlertTriangle, FiPackage, FiMapPin, FiUser, FiCalendar, FiCreditCard } from 'react-icons/fi';
import axios from 'axios';

type OrderItem = {
  productId: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address?: string;
  deliveryMethod: 'pickup' | 'delivery';
  paymentMethod: 'cash' | 'card';
  comment?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  createdAt: string;
  updatedAt: string;
};

export default function OrderDetails() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Редирект неавторизованных пользователей
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Загрузка данных заказа
  useEffect(() => {
    const fetchOrder = async () => {
      if (status !== 'authenticated' || !session?.user?.id || !orderId) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        const response = await axios.get(`/api/orders/${orderId}`);
        
        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          setError('Заказ не найден или у вас нет прав для его просмотра');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при загрузке данных заказа');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [session, status, orderId]);
  
  // Статусы заказов на русском
  const orderStatusMap: Record<string, { label: string, color: string }> = {
    'pending': { label: 'Ожидает обработки', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    'processing': { label: 'В обработке', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
    'shipped': { label: 'Отправлен', color: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
    'delivered': { label: 'Доставлен', color: 'bg-green-100 text-green-800 border border-green-200' },
    'canceled': { label: 'Отменен', color: 'bg-pink-100 text-pink-800 border border-pink-200' },
  };
  
  // Если пользователь не авторизован, не отображаем страницу
  if (status === 'unauthenticated') {
    return null;
  }
  
  // Отображаем прелоадер при загрузке
  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
          <div className="h-32 bg-gray-200 rounded max-w-4xl mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <FiAlertTriangle className="mx-auto text-pink-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Заказ не найден</h1>
          <p className="text-gray-600 mb-8">{error || 'Запрашиваемый заказ не существует или был удален.'}</p>
          <Link 
            href="/profile" 
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600 transition"
          >
            <FiArrowLeft className="mr-2" />
            Вернуться в профиль
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Декоративные элементы сверху */}
      <div className="relative mb-8">
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
      </div>

      {/* Заголовок */}
      <div className="text-center mb-10 relative">
        <h1 className="text-4xl font-bold mb-4 text-brand-primary relative inline-block">
          Детали заказа
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl">📋</span>
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto"></div>
      </div>

      {/* Навигация */}
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center text-pink-500 hover:text-pink-600 hover:underline font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Вернуться в профиль
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Основная информация о заказе */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100 relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
          <div className="p-6 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-brand-primary">Заказ #{order.orderNumber}</h2>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${orderStatusMap[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                {orderStatusMap[order.status]?.label || 'Неизвестный статус'}
              </span>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-white to-pink-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiCalendar className="mt-1 mr-3 text-pink-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Дата оформления</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiUser className="mt-1 mr-3 text-pink-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Покупатель</p>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.phone}</p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiPackage className="mt-1 mr-3 text-pink-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Способ доставки</p>
                    <p className="font-medium">
                      {order.deliveryMethod === 'pickup' ? 'Самовывоз из магазина' : 'Доставка'}
                    </p>
                  </div>
                </div>
                
                {order.deliveryMethod === 'delivery' && order.address && (
                  <div className="flex items-start">
                    <FiMapPin className="mt-1 mr-3 text-pink-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Адрес доставки</p>
                      <p className="font-medium">{order.address}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <FiCreditCard className="mt-1 mr-3 text-pink-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Способ оплаты</p>
                    <p className="font-medium">
                      {order.paymentMethod === 'cash' ? 'Наличными при получении' : 'Банковской картой'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {order.comment && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800 font-medium mb-1">Комментарий к заказу:</p>
                <p className="text-yellow-700">{order.comment}</p>
              </div>
            )}
          </div>
        </div>

        {/* Товары в заказе */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100 relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
          <div className="p-6 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white">
            <h2 className="text-xl font-semibold text-brand-primary">Товары в заказе</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.productId?.images?.[0] ? (
                      <Image 
                        src={item.productId.images[0]} 
                        alt={item.productId.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Нет фото
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-gray-800">{item.productId?.name || 'Товар удален'}</h3>
                    <p className="text-sm text-gray-600">Артикул: {item.productId?._id}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} м × {item.price} ₽ = {(item.quantity * item.price).toLocaleString()} ₽
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">
                      {(item.quantity * item.price).toLocaleString()} ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Итоговая сумма */}
            <div className="mt-6 pt-6 border-t border-pink-100">
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-gray-800">Итого к оплате:</span>
                <span className="text-pink-500">{order.totalAmount.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Статус доставки */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100 relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
          <div className="p-6 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white">
            <h2 className="text-xl font-semibold text-brand-primary">Статус заказа</h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <div className="relative">
                  {/* Прогресс-бар статусов */}
                  <div className="flex justify-between items-center relative">
                    {/* Pending */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        ['pending', 'processing', 'shipped', 'delivered'].includes(order.status) 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        1
                      </div>
                      <p className="text-xs mt-2 text-center">Принят</p>
                    </div>
                    
                    {/* Processing */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        ['processing', 'shipped', 'delivered'].includes(order.status) 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        2
                      </div>
                      <p className="text-xs mt-2 text-center">Обработка</p>
                    </div>
                    
                    {/* Shipped */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        ['shipped', 'delivered'].includes(order.status) 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        3
                      </div>
                      <p className="text-xs mt-2 text-center">Отправлен</p>
                    </div>
                    
                    {/* Delivered */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        order.status === 'delivered' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        4
                      </div>
                      <p className="text-xs mt-2 text-center">Доставлен</p>
                    </div>
                    
                    {/* Connecting lines */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 -z-10"></div>
                    <div className={`absolute top-4 left-0 h-0.5 bg-pink-500 -z-10 transition-all duration-500 ${
                      order.status === 'pending' ? 'w-0' :
                      order.status === 'processing' ? 'w-1/3' :
                      order.status === 'shipped' ? 'w-2/3' :
                      order.status === 'delivered' ? 'w-full' :
                      'w-0'
                    }`}></div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-lg font-medium text-gray-800">
                    Текущий статус: <span className="text-pink-500">{orderStatusMap[order.status]?.label}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Последнее обновление: {new Date(order.updatedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                
                {order.status === 'canceled' && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-red-700 text-center font-medium">Заказ был отменен</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Декоративные элементы снизу */}
      <div className="relative mt-10">
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
      </div>
    </div>
  );
} 