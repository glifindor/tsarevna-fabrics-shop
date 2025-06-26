"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiMapPin, FiPhone, FiMail, FiClock, FiCheck } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Схема валидации для формы обратной связи
const contactSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать не менее 2 символов" }),
  email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
  phone: z.string().min(10, { message: "Пожалуйста, введите корректный номер телефона" }),
  message: z.string().min(10, { message: "Сообщение должно содержать не менее 10 символов" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contacts() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Инициализация формы с валидацией
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });
  
  // Обработка отправки формы
  const onSubmit = (data: ContactFormData) => {
    // Здесь будет логика отправки формы на сервер
    console.log(data);
    
    // Имитация отправки
    setTimeout(() => {
      setIsSubmitted(true);
      reset();
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Контакты</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Информация о контактах */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6 text-emerald-700">Наши контакты</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <FiMapPin className="text-emerald-600 text-xl mt-1 mr-4" />
                <div>
                  <h3 className="font-bold mb-1">Адрес</h3>
                  <p className="text-gray-700">г. Москва, ул. Текстильщиков, д. 7, стр. 1</p>
                  <p className="text-gray-700">Мы находимся в 5 минутах ходьбы от станции метро &ldquo;Текстильщики&rdquo;</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiPhone className="text-emerald-600 text-xl mt-1 mr-4" />
                <div>
                  <h3 className="font-bold mb-1">Телефоны</h3>
                  <p className="text-gray-700">+7 (495) 123-45-67 - отдел продаж</p>
                  <p className="text-gray-700">+7 (495) 123-45-68 - оптовый отдел</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiMail className="text-emerald-600 text-xl mt-1 mr-4" />
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <p className="text-gray-700">info@tsarevna-shveyana.ru - общие вопросы</p>
                  <p className="text-gray-700">sales@tsarevna-shveyana.ru - отдел продаж</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiClock className="text-emerald-600 text-xl mt-1 mr-4" />
                <div>
                  <h3 className="font-bold mb-1">Режим работы</h3>
                  <p className="text-gray-700">Пн-Пт: с 9:00 до 20:00</p>
                  <p className="text-gray-700">Сб: с 10:00 до 18:00</p>
                  <p className="text-gray-700">Вс: с 10:00 до 17:00</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-bold mb-3">Реквизиты компании</h3>
              <div className="bg-gray-50 p-4 rounded-md text-sm">
                <p>ООО &ldquo;Царевна Швеяна&rdquo;</p>
                <p>ИНН: 7701234567</p>
                <p>КПП: 770101001</p>
                <p>ОГРН: 1157701234567</p>
                <p>Р/с: 40702810123450000123 в ПАО Сбербанк</p>
                <p>К/с: 30101810400000000225</p>
                <p>БИК: 044525225</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Форма обратной связи */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6 text-emerald-700">Связаться с нами</h2>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Сообщение отправлено!</h3>
                <p className="text-gray-600 mb-6">
                  Спасибо за ваше обращение. Мы свяжемся с вами в ближайшее время.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition"
                >
                  Отправить еще сообщение
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-1">
                    Ваше имя <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Иванов Иван"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="example@mail.ru"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-gray-700 mb-1">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+7 (999) 123-45-67"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-red-500 text-sm">{errors.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray-700 mb-1">
                    Сообщение <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Напишите ваш вопрос или комментарий..."
                    {...register("message")}
                  ></textarea>
                  {errors.message && (
                    <p className="mt-1 text-red-500 text-sm">{errors.message.message}</p>
                  )}
                </div>
                
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 text-white py-3 rounded-md font-medium hover:bg-emerald-700 transition disabled:bg-emerald-400"
                  >
                    {isSubmitting ? "Отправка..." : "Отправить сообщение"}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="mt-8">
            <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition">
              <FiArrowLeft className="mr-2" />
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
