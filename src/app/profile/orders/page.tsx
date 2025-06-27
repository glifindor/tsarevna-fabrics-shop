"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiClock, FiCheck, FiX, FiTruck } from 'react-icons/fi';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address?: string;
  deliveryMethod: 'pickup' | 'delivery';
  paymentMethod: 'cash' | 'card';
  comment?: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Перенаправляем неавторизованных пользователей
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      redirect('/login');
    }
  }, [session, status]);

  // Загрузка заказов пользователя
  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        if (result.success) {
          setOrders(result.data);
        } else {
          setError(result.message || 'Ошибка при загрузке заказов');
        }
      } catch (err) {
        console.error('Ошибка при загрузке заказов:', err);
        setError('Ошибка при загрузке заказов');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchOrders();
    }
  }, [session]);

  // Функция для получения текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает подтверждения';
      case 'confirmed':
        return 'Подтверждён';
      case 'processing':
        return 'В обработке';
      case 'shipped':
        return 'Отправлен';
      case 'delivered':
        return 'Доставлен';
      case 'cancelled':
        return 'Отменён';
      default:
        return 'Неизвестный статус';
    }
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Функция для получения иконки статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'confirmed':
      case 'processing':
        return <FiPackage className="w-4 h-4" />;
      case 'shipped':
        return <FiTruck className="w-4 h-4" />;
      case 'delivered':
        return <FiCheck className="w-4 h-4" />;
      case 'cancelled':
        return <FiX className="w-4 h-4" />;
      default:
        return <FiPackage className="w-4 h-4" />;
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Декоративные элементы сверху */}
      <div className="relative mb-8">
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Заголовок и навигация */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center text-pink-500 hover:text-pink-600 hover:underline font-medium mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Вернуться в профиль
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-brand-primary relative inline-block">
              Мои заказы
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl">📋</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto"></div>
          </div>
        </div>

        {/* Содержимое */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100">
          <div className="p-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white">
            <h2 className="text-xl font-semibold text-brand-primary">
              История заказов
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка заказов...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4 text-6xl">😔</div>
                <h3 className="text-xl font-semibold mb-2 text-red-600">Ошибка</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4 text-6xl">📦</div>
                <h3 className="text-xl font-semibold mb-2">У вас пока нет заказов</h3>
                <p className="text-gray-600 mb-6">
                  Перейдите в каталог и выберите понравившиеся товары
                </p>
                <Link
                  href="/catalog"
                  className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-3 rounded-full font-medium hover:from-pink-500 hover:to-pink-600 transition shadow-soft hover:shadow-md"
                >
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-pink-100 rounded-xl p-6 bg-gradient-to-br from-white to-pink-50/30 hover:shadow-soft transition-shadow"
                  >
                    {/* Заголовок заказа */}
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          Заказ №{order.orderNumber}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusText(order.status)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Информация о заказе */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded-lg border border-pink-100">
                        <p className="text-brand-secondary text-sm">Способ доставки:</p>
                        <p className="font-medium text-gray-800">
                          {order.deliveryMethod === 'pickup' ? 'Самовывоз' : 'Доставка'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-pink-100">
                        <p className="text-brand-secondary text-sm">Способ оплаты:</p>
                        <p className="font-medium text-gray-800">
                          {order.paymentMethod === 'cash' ? 'Наличными' : 'Банковской картой'}
                        </p>
                      </div>
                    </div>

                    {/* Товары в заказе */}
                    <div className="bg-white p-4 rounded-lg border border-pink-100 mb-4">
                      <h4 className="font-medium text-gray-800 mb-3">Товары:</h4>
                      <ul className="divide-y divide-pink-100">
                        {order.items.map((item, index) => (
                          <li key={index} className="py-2 flex justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{item.name}</p>
                              <p className="text-gray-600 text-sm">
                                {item.quantity} м × {item.price} ₽
                              </p>
                            </div>
                            <p className="font-medium text-gray-800">
                              {(item.price * item.quantity).toLocaleString()} ₽
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Итого и действия */}
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div className="mb-4 sm:mb-0">
                        <p className="text-lg font-bold text-pink-500">
                          Итого: {order.totalAmount.toLocaleString()} ₽
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/profile/orders/${order._id}`}
                          className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-pink-500 hover:to-pink-600 transition shadow-soft hover:shadow-md"
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Декоративные элементы снизу */}
      <div className="relative mt-8">
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
      </div>
    </div>
  );
} 