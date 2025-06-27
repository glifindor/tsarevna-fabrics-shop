"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
// import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiShoppingCart, FiUser } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: "/catalog" },
    { name: "О нас", href: "/about" },
    { name: "Контакты", href: "/contacts" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="bg-white shadow-md relative z-50">
      {/* Декоративная полоса */}
      <div className="h-1 bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400"></div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">          
          {/* Логотип */}
          <Link href="/" className="flex items-center">
            <div className="logo-container" style={{display: 'inline-flex', alignItems: 'flex-start'}}>
              <span className="text-2xl font-bold" style={{fontFamily: 'var(--font-title)', color: '#DB2777', display: 'inline-block'}}>
                ЦАРЕВНА <span style={{color: '#EC4899'}}>ШВЕЯНА</span>
              </span>
              <span className="inline-block align-top ml-1" style={{marginTop: '-8px'}}>
                <FaCrown style={{color: '#F59E0B', fontSize: 24, verticalAlign: 'top'}} />
              </span>
            </div>
            <div className="ml-2 text-xs text-gray-500 italic">волшебные ткани для рукоделия</div>
          </Link>



          {/* Десктопная навигация */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium hover:text-pink-500 transition-colors relative group ${
                  pathname === link.href ? 'text-pink-500' : 'text-gray-700'
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Иконки справа */}
          <div className="flex items-center space-x-5">
            <Link href="/cart" className="text-gray-700 hover:text-pink-500 transition-colors relative">
              <FiShoppingCart size={22} />
              {/* Если есть товары в корзине, показываем счетчик */}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}            </Link>

            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  className="text-gray-700 hover:text-pink-500 transition-colors flex items-center space-x-1 p-1"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <FiUser size={22} />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg py-2 z-50 border border-gray-100 animate-fadeIn">
                    {/* Заголовок с именем пользователя */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {session.user?.name || 'Пользователь'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    
                    {/* Пункты меню */}
                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiUser className="mr-3" size={16} />
                        Личный кабинет
                      </Link>
                      
                      {session.user?.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaCrown className="mr-3" size={16} />
                          Админ-панель
                        </Link>
                      )}
                    </div>
                    
                    {/* Разделитель */}
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    {/* Кнопка выхода */}
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <svg className="mr-3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16,17 21,12 16,7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-pink-500 transition-colors flex items-center">
                <FiUser size={22} />
              </Link>
            )}

            {/* Мобильное меню - гамбургер */}
            <button
              className="text-gray-700 hover:text-pink-500 transition-colors md:hidden"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-pink-100">
            {/* Мобильная навигация */}
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium hover:text-pink-500 transition-colors ${
                    pathname === link.href ? 'text-pink-500' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {!session ? (
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Войти
                </Link>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Личный кабинет
                  </Link>
                  {session.user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Админ-панель
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Выйти
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
        {/* Декоративная линия внизу */}
      <div className="h-1 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-300"></div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
