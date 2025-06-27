'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionManager() {
  const { data: session, status } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.expires) {
      const expiresAt = new Date(session.expires).getTime();
      const now = Date.now();
      const timeLeft = expiresAt - now;

      // Показываем предупреждение за 24 часа до истечения
      const warningTime = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

      if (timeLeft <= 0) {
        // Сессия уже истекла
        setShowExpired(true);
      } else if (timeLeft <= warningTime && timeLeft > 0) {
        // До истечения меньше 24 часов
        setShowWarning(true);
      }

      // Проверяем статус каждые 30 минут
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const currentTimeLeft = expiresAt - currentTime;

        if (currentTimeLeft <= 0) {
          setShowExpired(true);
          setShowWarning(false);
        } else if (currentTimeLeft <= warningTime && !showWarning) {
          setShowWarning(true);
        }
      }, 30 * 60 * 1000); // 30 минут

      return () => clearInterval(interval);
    }
  }, [session, status, showWarning]);

  const handleExtendSession = () => {
    // Перенаправляем на любую защищенную страницу для обновления токена
    router.refresh();
    setShowWarning(false);
  };

  const handleLoginAgain = () => {
    router.push('/login');
  };

  if (status !== 'authenticated') {
    return null;
  }

  // Уведомление об истечении сессии
  if (showExpired) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⏰</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Сессия истекла
            </h3>
            <p className="text-gray-600 mb-6">
              Ваша сессия истекла. Пожалуйста, войдите в систему заново.
            </p>
            <button
              onClick={handleLoginAgain}
              className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition"
            >
              Войти заново
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Предупреждение о скором истечении
  if (showWarning) {
    const expiresAt = new Date(session.expires!).getTime();
    const now = Date.now();
    const hoursLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60));

    return (
      <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-40 max-w-sm">
        <div className="flex">
          <div className="text-yellow-400 mr-3">
            ⚠️
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800">
              Сессия скоро истечет
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              Ваша сессия истечет через {hoursLeft} {hoursLeft === 1 ? 'час' : hoursLeft < 5 ? 'часа' : 'часов'}
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleExtendSession}
                className="text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
              >
                Продлить сессию
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="text-xs text-yellow-700 hover:text-yellow-800"
              >
                Скрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 