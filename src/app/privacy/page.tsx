import React from 'react';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="page-title text-3xl font-bold mb-6">Политика конфиденциальности</h1>
      <h2 className="text-xl font-semibold mt-8 mb-2">1. Общие положения</h2>
      <p className="mb-4">Настоящая политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта &ldquo;Царевна Швеяна&rdquo;.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. Какие данные собираются</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Имя, фамилия, отчество</li>
        <li>Контактный телефон</li>
        <li>Email</li>
        <li>Адрес доставки</li>
        <li>IP-адрес, cookie, данные о браузере и устройстве</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. Для чего используются данные</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Для оформления и выполнения заказов</li>
        <li>Для обратной связи с пользователем</li>
        <li>Для отправки информационных и рекламных сообщений (с согласия пользователя)</li>
        <li>Для улучшения работы сайта и пользовательского опыта</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. Передача третьим лицам</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Данные могут быть переданы только для выполнения заказа (службы доставки, платёжные системы).</li>
        <li>Мы не передаём ваши данные третьим лицам для маркетинговых целей без вашего согласия.</li>
        <li>Данные могут быть предоставлены по требованию закона или суда.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. Хранение и защита данных</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Данные хранятся на защищённых серверах и обрабатываются с использованием современных средств защиты информации.</li>
        <li>Мы принимаем все разумные меры для предотвращения несанкционированного доступа, изменения или уничтожения данных.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">6. Права пользователя</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Пользователь имеет право запросить информацию о своих данных, изменить или удалить их, отозвать согласие на обработку.</li>
        <li>Для этого необходимо обратиться по контактам, указанным ниже.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">7. Контакты</h2>
      <p>По вопросам обработки персональных данных обращайтесь по телефону <a href="tel:+78001234567" className="text-pink-500 hover:underline">8 (800) 123-45-67</a> или email <a href="mailto:info@tsarevna-fabrics.ru" className="text-pink-500 hover:underline">info@tsarevna-fabrics.ru</a>.</p>
      <p className="mt-8 text-gray-500 text-sm">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
    </div>
  );
} 