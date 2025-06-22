"use client";

import { useState, useEffect } from 'react';
import { FiBarChart2, FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import apiClient from '@/lib/apiClient';

// Регистрируем компоненты ChartJS
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

// Типы для статистики
interface SalesData {
  date: string;
  amount: number;
}

interface ProductSalesData {
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
}

interface CategorySalesData {
  category: string;
  quantity: number;
  amount: number;
}

interface StatisticsData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesByDate: SalesData[];
  topProducts: ProductSalesData[];
  salesByCategory: CategorySalesData[];
  recentOrders: any[]; // Последние заказы
}

const StatisticsPage = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('month');

  // Загрузка статистики
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get('/api/orders?stats=1');
        if (response.success && response.data) {
          setStatistics(response.data);
        } else {
          setError(response.message || 'Не удалось загрузить данные статистики');
        }
      } catch (err) {
        console.error('Ошибка при загрузке статистики:', err);
        setError('Не удалось загрузить данные статистики');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatistics();
  }, [dateRange]);

  // Готовим данные для графиков
  const salesChartData = {
    labels: statistics?.salesByDate.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }) || [],
    datasets: [
      {
        label: 'Продажи (₽)',
        data: statistics?.salesByDate.map(item => item.amount) || [],
        borderColor: 'rgb(219, 39, 119)',
        backgroundColor: 'rgba(219, 39, 119, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const productChartData = {
    labels: statistics?.topProducts.map(item => item.productName) || [],
    datasets: [
      {
        label: 'Продажи (₽)',
        data: statistics?.topProducts.map(item => item.amount) || [],
        backgroundColor: [
          'rgba(219, 39, 119, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(244, 114, 182, 0.8)',
          'rgba(249, 168, 212, 0.8)',
          'rgba(251, 207, 232, 0.8)',
        ],
        borderColor: [
          'rgb(219, 39, 119)',
          'rgb(236, 72, 153)',
          'rgb(244, 114, 182)',
          'rgb(249, 168, 212)',
          'rgb(251, 207, 232)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryChartData = {
    labels: statistics?.salesByCategory.map(item => item.category) || [],
    datasets: [
      {
        data: statistics?.salesByCategory.map(item => item.amount) || [],
        backgroundColor: [
          'rgba(219, 39, 119, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(244, 114, 182, 0.8)',
          'rgba(249, 168, 212, 0.8)',
          'rgba(251, 207, 232, 0.8)',
          'rgba(253, 242, 248, 0.8)',
        ],
        borderColor: [
          'rgb(219, 39, 119)',
          'rgb(236, 72, 153)',
          'rgb(244, 114, 182)',
          'rgb(249, 168, 212)',
          'rgb(251, 207, 232)',
          'rgb(253, 242, 248)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6 w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-28 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="h-80 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-300 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Аналитика продаж</h1>
      
      {/* Фильтры по дате */}
      <div className="mb-6 flex space-x-2">
        <select 
          className="form-select rounded border border-gray-300 py-2 px-4"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="week">Последняя неделя</option>
          <option value="month">Последний месяц</option>
          <option value="quarter">Последний квартал</option>
          <option value="year">Последний год</option>
        </select>
      </div>
      
      {/* Общая информация */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Общие продажи</p>
              <h2 className="text-2xl font-bold">{statistics?.totalSales.toLocaleString('ru-RU')} ₽</h2>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <FiDollarSign className="text-xl text-pink-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <FiTrendingUp className="mr-1" />
            <span className="text-sm">+12.5% с прошлого месяца</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Заказы</p>
              <h2 className="text-2xl font-bold">{statistics?.totalOrders}</h2>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <FiShoppingBag className="text-xl text-pink-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <FiTrendingUp className="mr-1" />
            <span className="text-sm">+8.2% с прошлого месяца</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Клиенты</p>
              <h2 className="text-2xl font-bold">{statistics?.totalCustomers}</h2>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <FiUsers className="text-xl text-pink-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <FiTrendingUp className="mr-1" />
            <span className="text-sm">+5.1% с прошлого месяца</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Средний чек</p>
              <h2 className="text-2xl font-bold">{statistics?.averageOrderValue.toLocaleString('ru-RU')} ₽</h2>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <FiBarChart2 className="text-xl text-pink-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <FiTrendingUp className="mr-1" />
            <span className="text-sm">+3.8% с прошлого месяца</span>
          </div>
        </div>
      </div>
      
      {/* Графики */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Динамика продаж</h3>
          <div className="h-80">
            <Line 
              data={salesChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                },                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(context.parsed.y);
                        }
                        return label;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Топ товаров</h3>
          <div className="h-80">
            <Bar 
              data={productChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                  x: {
                    beginAtZero: true
                  }
                },                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.x !== null) {
                          label += new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(context.parsed.x);
                        }
                        return label;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Продажи по категориям</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie 
              data={categoryChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context: any) {
                        let label = context.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed !== null) {
                          label += new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(context.parsed);
                        }
                        return label;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Последние заказы</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    № Заказа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics?.recentOrders.map((order, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-600">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.amount.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'Доставлен' ? 'bg-green-100 text-green-800' : 
                          order.status === 'В пути' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
