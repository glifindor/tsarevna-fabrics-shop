"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiHeart } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery)}`;
    }
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
    <header className="bg-white shadow-md relative">
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

          {/* Поиск - скрыт на мобильных */}
          <div className="hidden md:flex items-center mx-4 flex-1 max-w-md">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск по названию или артикулу..."
                  className="form-input py-2 px-4 pr-10 border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
                >
                  <FiSearch size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium hover:text-pink-500 transition relative group ${
                  pathname === link.href ? 'text-pink-500' : 'text-gray-700'
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-400 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Иконки справа */}
          <div className="flex items-center space-x-5">
            <Link href="/favorites" className="text-gray-700 hover:text-pink-500 relative">
              <FiHeart size={22} />
            </Link>
            
            <Link href="/cart" className="text-gray-700 hover:text-pink-500 relative">
              <FiShoppingCart size={22} />
              {/* Если есть товары в корзине, показываем счетчик */}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}            </Link>

            {session ? (
              <div className="relative">
                <button 
                  className="text-gray-700 hover:text-pink-500 flex items-center"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <FiUser size={22} />
                </button>
                {isUserMenuOpen && (
                  <div ref={userMenuRef} className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-10 border border-pink-100">
                    <div className="px-4 py-2 border-b border-pink-100 text-sm font-medium text-gray-700">
                      {session.user?.name || 'Пользователь'}
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition" onClick={() => setIsUserMenuOpen(false)}>
                      Личный кабинет
                    </Link>
                    {session.user?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition" onClick={() => setIsUserMenuOpen(false)}>
                        Админ-панель
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-pink-500 flex items-center">
                <FiUser size={22} />
              </Link>
            )}

            {/* Мобильное меню - гамбургер */}
            <button
              className="text-gray-700 hover:text-pink-500 md:hidden"
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
            {/* Мобильный поиск */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск по названию или артикулу..."
                  className="form-input py-2 px-4 pr-10 border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
                >
                  <FiSearch size={18} />
                </button>
              </div>
            </form>

            {/* Мобильная навигация */}
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium hover:text-pink-500 transition ${
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
                  className="text-sm font-medium text-gray-700 hover:text-pink-500 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Войти
                </Link>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-gray-700 hover:text-pink-500 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Личный кабинет
                  </Link>
                  {session.user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-gray-700 hover:text-pink-500 transition"
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
                    className="text-left text-sm font-medium text-gray-700 hover:text-pink-500 transition"
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
    </header>
  );
}
