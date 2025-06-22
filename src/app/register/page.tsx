"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiUserPlus, FiAlertTriangle } from 'react-icons/fi';
import axios from 'axios';

// Схема валидации для формы регистрации
const registerSchema = z.object({
  name: z.string().min(3, { message: "Имя должно содержать не менее 3 символов" }),
  email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен содержать не менее 6 символов" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Инициализация формы с валидацией
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });
  
  // Функция для обработки отправки формы
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Отправляем запрос на регистрацию
      const response = await axios.post('/api/users', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      if (response.data.success) {
        // Авторизуем пользователя после успешной регистрации
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password
        });
        
        if (signInResult?.error) {
          setError('Регистрация успешна, но не удалось войти автоматически. Пожалуйста, войдите вручную.');
          router.push('/login');
          return;
        }
        
        // Редирект на главную страницу после успешной авторизации
        router.push('/');
      }
      
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      {/* Декоративные элементы сверху */}
      <div className="relative mb-8">
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
      </div>
      
      <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100 relative">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
        <div className="p-8 pt-10">
          <div className="text-center mb-8 relative">
            <h1 className="text-2xl font-bold text-brand-primary relative inline-block">
              Регистрация
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-xl">👑</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent mx-auto mt-2"></div>
          </div>
          
          {error && (
            <div className="p-4 mb-6 bg-pink-50 text-pink-700 rounded-xl border border-pink-200 flex items-start">
              <FiAlertTriangle className="mt-1 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
                ФИО <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  className={`w-full p-3 pl-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    errors.name ? 'border-pink-500' : 'border-pink-200'
                  } bg-pink-50/30`}
                  placeholder="Иванов Иван Иванович"
                  disabled={isLoading}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-pink-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                Email <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className={`w-full p-3 pl-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    errors.email ? 'border-pink-500' : 'border-pink-200'
                  } bg-pink-50/30`}
                  placeholder="example@mail.ru"
                  disabled={isLoading}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-pink-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
                Пароль <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  className={`w-full p-3 pl-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    errors.password ? 'border-pink-500' : 'border-pink-200'
                  } bg-pink-50/30`}
                  placeholder="Минимум 6 символов"
                  disabled={isLoading}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-pink-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 font-medium">
                Подтверждение пароля <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  className={`w-full p-3 pl-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    errors.confirmPassword ? 'border-pink-500' : 'border-pink-200'
                  } bg-pink-50/30`}
                  placeholder="Повторите пароль"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-pink-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-pink-500 hover:to-pink-600 transition flex justify-center items-center disabled:from-gray-300 disabled:to-gray-400 shadow-soft hover:shadow-md"
            >
              {isLoading ? (
                <span>Регистрация...</span>
              ) : (
                <>
                  <FiUserPlus className="mr-2" />
                  <span>Зарегистрироваться</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-pink-500 hover:text-pink-600 hover:underline font-medium">
                Войти
              </Link>
            </p>
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
