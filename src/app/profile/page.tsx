"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiShoppingBag, FiEdit, FiLock, FiLogOut, FiAlertTriangle } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import axios from 'axios';

type Order = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: any[];
};

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Редирект неавторизованных пользователей
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Загрузка данных профиля пользователя
  useEffect(() => {
    const fetchProfile = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        const response = await axios.get(`/api/users/${session.user.id}`);
        
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при загрузке данных профиля');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [session, status]);
  
  // Загрузка списка заказов пользователя
  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== 'authenticated' || !session?.user?.id || activeTab !== 'orders') return;
      
      try {
        setIsLoading(true);
        setError('');
        
        const response = await axios.get('/api/orders');
        
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при загрузке списка заказов');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [session, status, activeTab]);
  
  // Выход из аккаунта
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };
    // Статусы заказов на русском
  const orderStatusMap: Record<string, { label: string, color: string }> = {
    'pending': { label: 'Ожидает обработки', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    'processing': { label: 'В обработке', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
    'shipped': { label: 'Отправлен', color: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
    'delivered': { label: 'Доставлен', color: 'bg-green-100 text-green-800 border border-green-200' },
    'cancelled': { label: 'Отменен', color: 'bg-pink-100 text-pink-800 border border-pink-200' },
  };
  
  // Если пользователь не авторизован, не отображаем страницу
  if (status === 'unauthenticated') {
    return null;
  }
  
  // Отображаем прелоадер при загрузке
  if (status === 'loading' || !session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
          <div className="h-32 bg-gray-200 rounded max-w-2xl mx-auto"></div>
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

      <div className="text-center mb-10 relative">
        <h1 className="text-4xl font-bold mb-4 text-brand-primary relative inline-block">
          Личный кабинет
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl">👑</span>
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto"></div>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-pink-50 text-pink-700 rounded-xl border border-pink-200 flex items-start">
          <FiAlertTriangle className="mt-1 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Боковое меню */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100">
            <div className="p-6 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white">
              <h2 className="text-xl font-semibold text-brand-primary">Меню</h2>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all ${
                      activeTab === 'profile' 
                        ? 'bg-pink-50 text-brand-primary border border-pink-200' 
                        : 'hover:bg-pink-50/50 text-gray-700 border border-transparent'
                    }`}
                  >
                    <FiUser className={`mr-2 ${activeTab === 'profile' ? 'text-pink-500' : ''}`} />
                    <span>Мой профиль</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all ${
                      activeTab === 'orders' 
                        ? 'bg-pink-50 text-brand-primary border border-pink-200' 
                        : 'hover:bg-pink-50/50 text-gray-700 border border-transparent'
                    }`}
                  >
                    <FiShoppingBag className={`mr-2 ${activeTab === 'orders' ? 'text-pink-500' : ''}`} />
                    <span>Мои заказы</span>
                  </button>
                </li>
                
                {session.user.role === 'admin' && (
                  <li>
                    <Link
                      href="/admin"
                      className="w-full text-left px-4 py-3 rounded-xl flex items-center hover:bg-pink-50/50 text-gray-700 border border-transparent hover:border-pink-200"
                    >
                      <FiEdit className="mr-2" />
                      <span>Админ-панель</span>
                    </Link>
                  </li>
                )}
                
                <li className="pt-4 border-t border-pink-100 mt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl flex items-center text-pink-600 hover:bg-pink-50 border border-transparent hover:border-pink-200"
                  >
                    <FiLogOut className="mr-2" />
                    <span>Выйти</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Основной контент */}
        <div className="w-full md:w-3/4">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100 relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
              <div className="p-6 border-b border-pink-100">
                <h2 className="text-xl font-semibold text-brand-primary">Мой профиль</h2>
              </div>
              
              {isLoading ? (
                <div className="p-6 animate-pulse">
                  <div className="h-6 bg-pink-100 rounded-full w-1/4 mb-4"></div>
                  <div className="h-6 bg-pink-100 rounded-full w-1/3 mb-4"></div>
                  <div className="h-6 bg-pink-100 rounded-full w-1/2 mb-4"></div>
                </div>
              ) : profile ? (
                <div className="p-6 bg-gradient-to-br from-white to-pink-50/30">
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-soft">
                      <h3 className="text-brand-secondary text-sm mb-1">ФИО</h3>
                      <p className="font-medium text-lg text-gray-800">{profile.name}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-soft">
                      <h3 className="text-brand-secondary text-sm mb-1">Email</h3>
                      <p className="font-medium text-lg text-gray-800">{profile.email}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-soft">
                      <h3 className="text-brand-secondary text-sm mb-1">Роль</h3>
                      <p className="font-medium text-lg text-gray-800">
                        {profile.role === 'admin' ? 'Администратор' : 'Покупатель'}
                      </p>
                    </div>
                    
                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/profile/edit"
                        className="inline-flex items-center justify-center bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-3 rounded-full font-medium hover:from-pink-500 hover:to-pink-600 transition shadow-soft hover:shadow-md"
                      >
                        <FiEdit className="mr-2" />
                        <span>Редактировать профиль</span>
                      </Link>
                      
                      <Link
                        href="/profile/change-password"
                        className="inline-flex items-center justify-center bg-gray-100 text-gray-800 px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition border border-pink-100"
                      >
                        <FiLock className="mr-2" />
                        <span>Сменить пароль</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Не удалось загрузить данные профиля
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100 relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
              <div className="p-6 border-b border-pink-100">
                <h2 className="text-xl font-semibold text-brand-primary">Мои заказы</h2>
              </div>
              
              {isLoading ? (
                <div className="p-6 animate-pulse">
                  <div className="h-16 bg-pink-100 rounded-xl mb-4"></div>
                  <div className="h-16 bg-pink-100 rounded-xl mb-4"></div>
                  <div className="h-16 bg-pink-100 rounded-xl mb-4"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-pink-100">
                      <thead className="bg-pink-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider">
                            № заказа
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider">
                            Дата
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider">
                            Сумма
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider">
                            Статус
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-brand-secondary uppercase tracking-wider">
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-pink-100">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-pink-50/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.totalAmount.toLocaleString()} ₽
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${orderStatusMap[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                                {orderStatusMap[order.status]?.label || 'Неизвестный статус'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link 
                                href={`/profile/orders/${order._id}`} 
                                className="text-pink-500 hover:text-pink-600 hover:underline font-medium"
                              >
                                Подробнее
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto bg-pink-50 rounded-full flex items-center justify-center mb-4">
                    <FiShoppingBag className="text-pink-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-brand-primary">У вас еще нет заказов</h3>
                  <p className="text-gray-500 mb-6">Самое время что-нибудь заказать!</p>
                  <Link 
                    href="/catalog" 
                    className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600 transition shadow-soft hover:shadow-md"
                  >
                    Перейти в каталог
                  </Link>
                </div>
              )}
            </div>
          )}
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
