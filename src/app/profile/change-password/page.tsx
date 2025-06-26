"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLock, FiSave, FiAlertTriangle, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

// Схема валидации
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Введите текущий пароль" }),
  newPassword: z.string().min(6, { message: "Новый пароль должен содержать не менее 6 символов" }),
  confirmPassword: z.string().min(1, { message: "Подтвердите новый пароль" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePassword() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
    reset,
    formState: { errors } 
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });
  
  // Обработка отправки формы
  const onSubmit = async (data: PasswordFormData) => {
    if (!session?.user?.id) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await axios.put(`/api/users/${session.user.id}/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (response.data.success) {
        setSuccess('Пароль успешно изменен!');
        reset(); // Очищаем форму
        
        // Перенаправляем обратно в профиль через 3 секунды
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } else {
        setError(response.data.message || 'Ошибка при изменении пароля');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при изменении пароля');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Если пользователь не авторизован, не отображаем страницу
  if (status === 'unauthenticated') {
    return null;
  }
  
  // Отображаем прелоадер при загрузке
  if (status === 'loading') {
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
          Смена пароля
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl">🔒</span>
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
            <h2 className="text-xl font-semibold text-brand-primary">Изменение пароля</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-gradient-to-br from-white to-pink-50/30">
            <div className="space-y-6">
              {/* Текущий пароль */}
              <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                <label htmlFor="currentPassword" className="block text-gray-700 mb-2 font-medium">
                  Текущий пароль <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    className={`w-full p-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      errors.currentPassword ? 'border-pink-500' : 'border-pink-200'
                    } bg-pink-50/30`}
                    placeholder="Введите текущий пароль"
                    {...register("currentPassword")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-pink-500"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-pink-500 text-sm">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* Новый пароль */}
              <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                <label htmlFor="newPassword" className="block text-gray-700 mb-2 font-medium">
                  Новый пароль <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    className={`w-full p-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      errors.newPassword ? 'border-pink-500' : 'border-pink-200'
                    } bg-pink-50/30`}
                    placeholder="Введите новый пароль"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-pink-500"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-pink-500 text-sm">{errors.newPassword.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Пароль должен содержать не менее 6 символов
                </p>
              </div>

              {/* Подтверждение пароля */}
              <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 font-medium">
                  Подтвердите новый пароль <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className={`w-full p-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      errors.confirmPassword ? 'border-pink-500' : 'border-pink-200'
                    } bg-pink-50/30`}
                    placeholder="Повторите новый пароль"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-pink-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-pink-500 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Информация о безопасности */}
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">💡 Рекомендации по безопасности:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Используйте уникальный пароль для каждого сайта</li>
                  <li>• Включите буквы, цифры и специальные символы</li>
                  <li>• Не используйте личную информацию в пароле</li>
                  <li>• Регулярно меняйте пароли</li>
                </ul>
              </div>
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
                disabled={isSubmitting || Boolean(success)}
                className={`w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 px-8 rounded-full font-medium transition shadow-soft hover:shadow-md ${
                  isSubmitting || Boolean(success)
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-pink-500 hover:to-pink-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Изменение...
                  </>
                ) : Boolean(success) ? (
                  <>
                    <FiCheck className="mr-2" />
                    Пароль изменен
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Изменить пароль
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