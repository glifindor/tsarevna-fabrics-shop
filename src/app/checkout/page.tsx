"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import axios from 'axios';

// Новый список транспортных компаний
const DELIVERY_COMPANIES = [
  'СДЭК',
  'Boxberry',
  'Почта России',
  'Деловые линии',
  'PickPoint',
  'Курьер',
];

// Новая схема валидации
const checkoutSchema = z.object({
  customerName: z.string().min(3, { message: "Имя должно содержать не менее 3 символов" }),
  phone: z.string().min(10, { message: "Пожалуйста, введите корректный номер телефона" }),
  email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
  deliveryMethod: z.enum(["pickup", "delivery"], {
    errorMap: () => ({ message: "Выберите способ доставки" })
  }),
  paymentMethod: z.enum(["cash", "card"], {
    errorMap: () => ({ message: "Выберите способ оплаты" })
  }),
  // Новые поля для доставки
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  recipientEmail: z.string().optional(),
  deliveryCompany: z.string().optional(),
  address: z.string().optional(),
  comment: z.string().optional(),
  agreement: z.literal(true, {
    errorMap: () => ({ message: "Необходимо согласиться с условиями" })
  })
}).refine(
  data => data.deliveryMethod !== "delivery" || (
    data.address && data.address.length > 0 &&
    data.recipientName && data.recipientName.length > 0 &&
    data.recipientPhone && data.recipientPhone.length > 0 &&
    data.deliveryCompany && data.deliveryCompany.length > 0
  ),
  {
    message: "Для доставки заполните все поля получателя, адрес и выберите транспортную компанию",
    path: ["address"]
  }
);

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, clearCart, totalAmount } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderError, setOrderError] = useState("");
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  
  // Состояния для сохранения данных о заказе ДО очистки корзины
  const [orderTotalAmount, setOrderTotalAmount] = useState(0);
  const [orderItemsCount, setOrderItemsCount] = useState(0);

  // Перенаправляем на страницу корзины, если в ней нет товаров
  useEffect(() => {
    if (cart.items.length === 0 && !orderComplete) {
      router.push('/cart');
    }
  }, [cart.items.length, orderComplete, router]);

  // Инициализация формы с валидацией
  const { 
    register, 
    handleSubmit, 
    watch,
    setValue,
    formState: { errors } 
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "pickup",
      paymentMethod: "cash",
    }
  });

  // Предзаполняем форму данными из сессии, если пользователь авторизован
  useEffect(() => {
    if (session?.user) {
      setValue('customerName', session.user.name || '');
      setValue('email', session.user.email || '');
    }
  }, [session, setValue]);

  // Отслеживаем выбранный способ доставки
  const deliveryMethod = watch("deliveryMethod");
  
  // Функция для обработки отправки формы
  const onSubmit = () => {
    setStep('confirmation');
  };
  // Функция для подтверждения и отправки заказа
  const confirmOrder = async () => {
    try {
      setIsSubmitting(true);
      setOrderError("");
      const formData = watch();
      
      console.log('🔍 Отправка заказа в API...');
      
      // Отправляем заказ в API для сохранения в базу данных
      const orderResponse = await axios.post('/api/orders', {
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address || '',
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        comment: formData.comment || ''
      });
      
      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Ошибка при создании заказа');
      }
      
      const { orderNumber: orderNum } = orderResponse.data.data;
      console.log('✅ Заказ создан в базе данных:', orderNum);
      
      // Формируем текст для Telegram
      let tgText = `🧵 Новый заказ #${orderNum}\n`;
      tgText += `Имя: ${formData.customerName}\nТелефон: ${formData.phone}\nEmail: ${formData.email}\n`;
      tgText += `Способ доставки: ${formData.deliveryMethod === 'pickup' ? 'Самовывоз' : 'Доставка'}\n`;
      tgText += `Способ оплаты: ${formData.paymentMethod === 'cash' ? 'Наличными' : 'Картой'}\n`;
      if (formData.deliveryMethod === 'delivery') {
        tgText += `Получатель: ${formData.recipientName}\nТелефон получателя: ${formData.recipientPhone}\nEmail получателя: ${formData.recipientEmail}\n`;
        tgText += `ТК: ${formData.deliveryCompany}\nАдрес: ${formData.address}\n`;
      }
      tgText += `Комментарий: ${formData.comment || '-'}\n`;
      tgText += `Товары:\n`;
      cart.items.forEach((item, idx) => {
        tgText += `${idx + 1}. ${item.name} — ${item.quantity} м × ${item.price} ₽\n`;
      });
      tgText += `Итого: ${totalAmount.toLocaleString()} ₽`;
      
      // Отправка в Telegram (опционально)
      const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
      
      if (botToken && chatId) {
        try {
          await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: tgText,
            parse_mode: 'HTML',
          });
          console.log('✅ Уведомление в Telegram отправлено успешно');
        } catch (telegramError) {
          console.error('⚠️ Ошибка отправки в Telegram:', telegramError);
          // Не прерываем процесс оформления заказа из-за ошибки Telegram
        }
      } else {
        console.log('ℹ️ Telegram уведомления не настроены');
      }
      
      // Сохраняем данные заказа ДО очистки корзины
      setOrderTotalAmount(totalAmount);
      setOrderItemsCount(cart.items.length);
      
      // Очищаем корзину после успешной отправки заказа
      console.log('🧹 Очищаем корзину...');
      await clearCart();
      console.log('✅ Корзина очищена');
      
      setOrderComplete(true);
      setOrderNumber(orderNum);
    } catch (error: any) {
      console.error('❌ Ошибка при оформлении заказа:', error);
      let msg = "Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.";
      if (error?.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error?.message) {
        msg = error.message;
      }
      setOrderError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Если заказ успешно оформлен
  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Декоративные элементы сверху */}
        <div className="relative mb-8">
          <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
          <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft p-8 text-center border border-pink-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-50">
            <FiCheck className="text-green-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-brand-primary">Заказ успешно оформлен!</h1>
          <p className="text-gray-600 mb-8">
            Ваш заказ №{orderNumber} принят в обработку. Информация о заказе в личном кабинете.
          </p>
          <div className="mb-8 p-6 bg-pink-50/50 rounded-xl border border-pink-100">
            <h2 className="font-bold mb-4 text-brand-primary">Детали заказа:</h2>
            <p className="text-gray-700 mb-2">Сумма заказа: {orderTotalAmount.toLocaleString()} ₽</p>
            <p className="text-gray-700 mb-2">Количество товаров: {orderItemsCount}</p>
            {session?.user && (
              <div className="mt-4">
                <Link 
                  href="/profile/orders" 
                  className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium text-sm"
                >
                  📋 Перейти в личный кабинет
                </Link>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/catalog" 
              className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-3 rounded-full font-medium hover:from-pink-500 hover:to-pink-600 transition shadow-soft hover:shadow-md"
            >
              Продолжить покупки
            </Link>
            <Link 
              href="/" 
              className="bg-gray-100 text-gray-800 px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition border border-pink-100"
            >
              На главную
            </Link>
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

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Декоративные элементы сверху */}
      <div className="relative mb-8">
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
      </div>
      
      <div className="text-center mb-10 relative">
        <h1 className="text-4xl font-bold mb-4 text-brand-primary relative inline-block">
          Оформление заказа
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl">👑</span>
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto"></div>
      </div>

      {step === 'form' ? (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Форма оформления заказа */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100 relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
              <div className="p-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white">
                <h2 className="text-xl font-semibold text-brand-primary">Данные для заказа</h2>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-gradient-to-br from-white to-pink-50/30">
                <div className="space-y-8">
                  {/* Контактные данные */}
                  <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                    <h3 className="text-lg font-medium mb-4 text-brand-primary">Контактные данные</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="customerName" className="block text-gray-700 mb-2 font-medium">
                          ФИО <span className="text-pink-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="customerName"
                          className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                            errors.customerName ? 'border-pink-500' : 'border-pink-200'
                          } bg-pink-50/30`}
                          placeholder="Иванов Иван Иванович"
                          {...register("customerName")}
                        />
                        {errors.customerName && (
                          <p className="mt-1 text-pink-500 text-sm">{errors.customerName.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-gray-700 mb-2 font-medium">
                          Телефон <span className="text-pink-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                            errors.phone ? 'border-pink-500' : 'border-pink-200'
                          } bg-pink-50/30`}
                          placeholder="+7 (999) 123-45-67"
                          {...register("phone")}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-pink-500 text-sm">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                        Email <span className="text-pink-500">*</span>
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
                  </div>

                  {/* Доставка */}
                  <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                    <h3 className="text-lg font-medium mb-4 text-brand-primary">Способ доставки</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="pickup"
                          value="pickup"
                          className="mr-2 accent-pink-500 h-4 w-4"
                          {...register("deliveryMethod")}
                        />
                        <label htmlFor="pickup" className="text-gray-700">
                          Самовывоз из магазина
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="delivery"
                          value="delivery"
                          className="mr-2 accent-pink-500 h-4 w-4"
                          {...register("deliveryMethod")}
                        />
                        <label htmlFor="delivery" className="text-gray-700">
                          Доставка
                        </label>
                      </div>
                      {errors.deliveryMethod && (
                        <p className="mt-1 text-pink-500 text-sm">{errors.deliveryMethod.message}</p>
                      )}
                    </div>

                    {deliveryMethod === "delivery" && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="recipientName" className="block text-gray-700 mb-2 font-medium">ФИО получателя <span className="text-pink-500">*</span></label>
                          <input type="text" id="recipientName" className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.recipientName ? 'border-pink-500' : 'border-pink-200'} bg-pink-50/30`} placeholder="ФИО получателя" {...register("recipientName")} />
                          {errors.recipientName && <p className="mt-1 text-pink-500 text-sm">{errors.recipientName.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="recipientPhone" className="block text-gray-700 mb-2 font-medium">Телефон получателя <span className="text-pink-500">*</span></label>
                          <input type="tel" id="recipientPhone" className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.recipientPhone ? 'border-pink-500' : 'border-pink-200'} bg-pink-50/30`} placeholder="Телефон получателя" {...register("recipientPhone")} />
                          {errors.recipientPhone && <p className="mt-1 text-pink-500 text-sm">{errors.recipientPhone.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="recipientEmail" className="block text-gray-700 mb-2 font-medium">Email получателя</label>
                          <input type="email" id="recipientEmail" className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.recipientEmail ? 'border-pink-500' : 'border-pink-200'} bg-pink-50/30`} placeholder="Email получателя (необязательно)" {...register("recipientEmail")} />
                        </div>
                        <div>
                          <label htmlFor="deliveryCompany" className="block text-gray-700 mb-2 font-medium">Транспортная компания <span className="text-pink-500">*</span></label>
                          <select id="deliveryCompany" className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.deliveryCompany ? 'border-pink-500' : 'border-pink-200'} bg-pink-50/30`} {...register("deliveryCompany")}> <option value="">Выберите компанию</option> {DELIVERY_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)} </select>
                          {errors.deliveryCompany && <p className="mt-1 text-pink-500 text-sm">{errors.deliveryCompany.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="address" className="block text-gray-700 mb-2 font-medium">Адрес доставки <span className="text-pink-500">*</span></label>
                          <textarea id="address" rows={3} className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.address ? 'border-pink-500' : 'border-pink-200'} bg-pink-50/30`} placeholder="Город, улица, дом, квартира, индекс" {...register("address")} ></textarea>
                          {errors.address && <p className="mt-1 text-pink-500 text-sm">{errors.address.message}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Способ оплаты */}
                  <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                    <h3 className="text-lg font-medium mb-4 text-brand-primary">Способ оплаты</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="cash"
                          value="cash"
                          className="mr-2 accent-pink-500 h-4 w-4"
                          {...register("paymentMethod")}
                        />
                        <label htmlFor="cash" className="text-gray-700">
                          Наличными при получении
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="card"
                          value="card"
                          className="mr-2 accent-pink-500 h-4 w-4"
                          {...register("paymentMethod")}
                        />
                        <label htmlFor="card" className="text-gray-700">
                          Банковской картой
                        </label>
                      </div>
                      {errors.paymentMethod && (
                        <p className="mt-1 text-pink-500 text-sm">{errors.paymentMethod.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Комментарий */}
                  <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                    <label htmlFor="comment" className="block text-gray-700 mb-2 font-medium">
                      Комментарий к заказу
                    </label>
                    <textarea
                      id="comment"
                      rows={3}
                      className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/30"
                      placeholder="Дополнительная информация по заказу"
                      {...register("comment")}
                    ></textarea>
                  </div>

                  {/* Согласие */}
                  <div className="bg-white p-5 rounded-xl border border-pink-100 shadow-soft">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="agreement"
                        className="mt-1 mr-2 accent-pink-500 h-4 w-4"
                        {...register("agreement")}
                      />
                      <label htmlFor="agreement" className="text-gray-700 text-sm">
                        Оформляя заказ, вы соглашаетесь с нашими{' '}
                        <Link href="/license" className="text-pink-500 hover:text-pink-600 hover:underline font-medium">условиями использования</Link>{' '}и{' '}
                        <Link href="/privacy" className="text-pink-500 hover:text-pink-600 hover:underline font-medium">политикой конфиденциальности</Link>.
                      </label>
                    </div>
                    {errors.agreement && (
                      <p className="mt-1 text-pink-500 text-sm">{errors.agreement.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
                  <Link
                    href="/cart"
                    className="inline-flex items-center text-pink-500 hover:text-pink-600 hover:underline font-medium mb-4 sm:mb-0"
                  >
                    <FiArrowLeft className="mr-2" />
                    Вернуться в корзину
                  </Link>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 px-8 rounded-full font-medium hover:from-pink-500 hover:to-pink-600 transition shadow-soft hover:shadow-md"
                  >
                    Продолжить
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Сводка заказа */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-soft overflow-hidden sticky top-4 border border-pink-100 relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
              <div className="p-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white">
                <h2 className="text-xl font-semibold text-brand-primary">Ваш заказ</h2>
              </div>
              <div className="p-4 bg-gradient-to-br from-white to-pink-50/30">
                <ul className="divide-y divide-pink-100 mb-4">
                  {cart.items.map((item) => (
                    <li key={item.productId} className="py-3 flex justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-gray-600 text-sm">{item.quantity} м × {item.price} ₽</p>
                      </div>
                      <p className="font-medium text-gray-800">{((item.price || 0) * item.quantity).toLocaleString()} ₽</p>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t border-pink-100 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Итого:</span>
                    <span className="text-pink-500">{totalAmount.toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-pink-100 relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300"></div>
            <div className="p-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white">
              <h2 className="text-xl font-semibold text-brand-primary">Подтверждение заказа</h2>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-white to-pink-50/30">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 text-brand-primary">Проверьте данные перед отправкой</h3>
                
                {orderError && (
                  <div className="p-4 mb-4 bg-pink-50 text-pink-700 rounded-xl border border-pink-200 flex items-start">
                    <FiAlertTriangle className="mt-1 mr-2 flex-shrink-0" />
                    <p>{orderError}</p>
                  </div>
                )}
                
                <div className="bg-pink-50/50 p-5 rounded-xl border border-pink-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-pink-100">
                      <p className="text-brand-secondary text-sm">ФИО:</p>
                      <p className="font-medium text-gray-800">{watch("customerName")}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-pink-100">
                      <p className="text-brand-secondary text-sm">Телефон:</p>
                      <p className="font-medium text-gray-800">{watch("phone")}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-pink-100">
                    <p className="text-brand-secondary text-sm">Email:</p>
                    <p className="font-medium text-gray-800">{watch("email")}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-pink-100">
                    <p className="text-brand-secondary text-sm">Способ доставки:</p>
                    <p className="font-medium text-gray-800">
                      {watch("deliveryMethod") === "pickup" ? "Самовывоз из магазина" : "Доставка"}
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-pink-100">
                    <p className="text-brand-secondary text-sm">Способ оплаты:</p>
                    <p className="font-medium text-gray-800">
                      {watch("paymentMethod") === "cash" ? "Наличными при получении" : "Банковской картой"}
                    </p>
                  </div>
                  
                  {watch("deliveryMethod") === "delivery" && (
                    <div className="bg-white p-3 rounded-lg border border-pink-100">
                      <p className="text-brand-secondary text-sm">Адрес доставки:</p>
                      <p className="font-medium text-gray-800">{watch("address")}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 text-brand-primary">Товары в заказе</h3>
                <div className="bg-white p-4 rounded-xl border border-pink-100">
                  <ul className="divide-y divide-pink-100 mb-4">
                    {cart.items.map((item) => (
                      <li key={item.productId} className="py-3 flex justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-gray-600 text-sm">{item.quantity} м × {item.price} ₽</p>
                        </div>
                        <p className="font-medium text-gray-800">{((item.price || 0) * item.quantity).toLocaleString()} ₽</p>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="border-t border-pink-100 pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Итого:</span>
                      <span className="text-pink-500">{totalAmount.toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8">
                <button
                  onClick={() => setStep('form')}
                  className="inline-flex items-center text-pink-500 hover:text-pink-600 hover:underline font-medium mb-4 sm:mb-0"
                >
                  <FiArrowLeft className="mr-2" />
                  Вернуться к редактированию
                </button>
                <button
                  onClick={confirmOrder}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 px-8 rounded-full font-medium hover:from-pink-500 hover:to-pink-600 transition shadow-soft hover:shadow-md disabled:from-gray-300 disabled:to-gray-400"
                >
                  {isSubmitting ? "Оформление..." : "Подтвердить заказ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Декоративные элементы снизу */}
      <div className="relative mt-10">
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
      </div>
    </div>
  );
}
