'use client';
import Link from 'next/link';
import { FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          setCatError(data.message || 'Ошибка при загрузке категорий');
        }
      } catch (e) {
        setCatError('Ошибка при загрузке категорий');
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="bg-pink-50 text-gray-700 mt-auto relative">
      {/* Декоративный верхний бордер */}
      <div className="h-1 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-300"></div>
      
      {/* Декоративный узор фона */}
      <div className="absolute inset-0 fabric-pattern opacity-20"></div>
      
      <div className="container mx-auto px-4 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* О компании */}
          <div>
            <div className="logo-container relative mb-4">
              <h3 className="text-xl font-semibold" style={{fontFamily: 'var(--font-title)', color: '#DB2777'}}>
                ЦАРЕВНА <span style={{color: '#EC4899'}}>ШВЕЯНА</span>
              </h3>
              <span className="crown-top">
                <FaCrown />
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Магазин высококачественных тканей для воплощения ваших творческих идей в жизнь.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-600 transition"
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Категории */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-500">Категории</h3>
            <ul className="space-y-2">
              {catLoading ? (
                <li className="text-gray-400">Загрузка...</li>
              ) : catError ? (
                <li className="text-red-400">{catError}</li>
              ) : categories.length === 0 ? (
                <li className="text-gray-400">Нет категорий</li>
              ) : (
                categories.map((cat) => (
                  <li key={cat._id}>
                    <Link href={`/catalog?category=${cat.slug}`} className="text-gray-600 hover:text-pink-500 transition text-sm flex items-center">
                      <span className="mr-2 text-pink-300">✿</span>
                      {cat.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-500">Информация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-pink-500 transition text-sm flex items-center">
                  <span className="mr-2 text-pink-300">✿</span>
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-gray-600 hover:text-pink-500 transition text-sm flex items-center">
                  <span className="mr-2 text-pink-300">✿</span>
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-600 hover:text-pink-500 transition text-sm flex items-center">
                  <span className="mr-2 text-pink-300">✿</span>
                  Условия возврата
                </Link>
              </li>
              <li>
                <Link href="/license" className="text-gray-600 hover:text-pink-500 transition text-sm flex items-center">
                  <span className="mr-2 text-pink-300">✿</span>
                  Условия использования
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-pink-500 transition text-sm flex items-center">
                  <span className="mr-2 text-pink-300">✿</span>
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-gray-600 hover:text-pink-500 transition text-sm flex items-center">
                  <span className="mr-2 text-pink-300">✿</span>
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-500">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <FiPhone className="text-pink-500" />
                <a href="tel:+78001234567" className="text-gray-600 hover:text-pink-500 transition text-sm">
                  8 (800) 123-45-67
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-pink-500" />
                <a href="mailto:info@tsarevna-fabrics.ru" className="text-gray-600 hover:text-pink-500 transition text-sm">
                  info@tsarevna-fabrics.ru
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <FiMapPin className="text-pink-500 mt-1" />
                <span className="text-gray-600 text-sm">
                  г. Москва, ул. Текстильщиков, 10, ТЦ "Мануфактура"
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pink-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {currentYear} Царевна Швеяна. Все права защищены.</p>
        </div>
      </div>
      
      {/* Декоративный нижний бордер */}
      <div className="h-1 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-300"></div>
    </footer>
  );
}
