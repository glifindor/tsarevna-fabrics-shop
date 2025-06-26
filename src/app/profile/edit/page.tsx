"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiSave, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

// Схема валидации
const profileSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать не менее 2 символов" }),
  email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

export default function EditProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Редирект неавторизованных пользователей
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Инициализация формы
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors } 
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });
  
  // Загрузка данных профиля
  useEffect(() => {
    const fetchProfile = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        const response = await axios.get(`/api/users/${session.user.id}`);
        
        if (response.data.success) {
          const userData = response.data.data;
          setProfile(userData);
          
          // Заполняем форму текущими данными
          setValue('name', userData.name);
          setValue('email', userData.email);
        } else {
          setError('Не удалось загрузить данные профиля');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при загрузке данных профиля');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [session, status, setValue]);
  
  // Обработка отправки формы
  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.user?.id) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await axios.put(`/api/users/${session.user.id}`, {
        name: data.name,
        email: data.email,
      });
      
      if (response.data.success) {
        setSuccess('Профиль успешно обновлен!');
        
        // Обновляем данные в сессии
        await update();
        
        // Перенаправляем обратно в профиль через 2 секунды
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        setError(response.data.message || 'Ошибка при обновлении профиля');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при обновлении профиля');
    } finally {
      setIsSubmitting(false);
    }
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
          Редактирование профиля
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl">✏️</span>
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto"></div>
      </div>
      
      <div className="max-w-2xl mx-auto">
        {/* Уведомления */}
        {error && (
          <div className="p-4 mb-6 bg-pink-50 text-pink-700 rounded-xl border border-pink-200 flex items-start">
            <FiAlertTriangle className="mt-1 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 mb-6 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-start">
            <FiCheck className="mt-1 mr-2 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100 relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
          <div className="p-6 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white">
            <h2 className="text-xl font-semibold text-brand-primary">Основная информация</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-gradient-to-br from-white to-pink-50/30">
            <div className="space-y-6">
              {/* Имя */}
              <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
                  Полное имя <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    errors.name ? 'border-pink-500' : 'border-pink-200'
                  } bg-pink-50/30`}
                  placeholder="Введите ваше полное имя"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-pink-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                  Email адрес <span className="text-pink-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    errors.email ? 'border-pink-500' : 'border-pink-200'
                  } bg-pink-50/30`}
                  placeholder="example@mail.ru"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-pink-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Роль (только для просмотра) */}
              {profile && (
                <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Роль в системе
                  </label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-700">
                      {profile.role === 'admin' ? 'Администратор' : 'Покупатель'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Роль назначается администратором и не может быть изменена
                  </p>
                </div>
              )}
            </div>

            {/* Кнопки */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Link
                href="/profile"
                className="inline-flex items-center text-pink-500 hover:text-pink-600 hover:underline font-medium"
              >
                <FiArrowLeft className="mr-2" />
                Вернуться в профиль
              </Link>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 px-8 rounded-full font-medium transition shadow-soft hover:shadow-md ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-pink-500 hover:to-pink-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Сохранить изменения
                  </>
                )}
              </button>
            </div>
          </form>
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