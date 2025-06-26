'use client';

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-pink-600">
          Доставка и оплата
        </h1>

        {/* Способы доставки */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-pink-500">Способы доставки</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100">
              <h3 className="text-xl font-medium mb-4 text-pink-600">Самовывоз</h3>
              <p className="text-gray-600 mb-4">
                Забрать заказ можно в нашем магазине по адресу:
              </p>
              <address className="text-gray-700 not-italic">
                г. Москва, ул. Текстильщиков, 10<br />
                ТЦ "Мануфактура"
              </address>
              <p className="text-green-600 font-medium mt-3">Бесплатно</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100">
              <h3 className="text-xl font-medium mb-4 text-pink-600">Доставка курьером</h3>
              <p className="text-gray-600 mb-4">
                Доставляем по всей России через транспортные компании:
              </p>
              <ul className="text-gray-700 space-y-1">
                <li>• СДЭК</li>
                <li>• Почта России</li>
                <li>• DPD</li>
                <li>• Boxberry</li>
              </ul>
              <p className="text-pink-600 font-medium mt-3">От 300 ₽</p>
            </div>
          </div>
        </section>

        {/* Способы оплаты */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-pink-500">Способы оплаты</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100">
              <h3 className="text-xl font-medium mb-4 text-pink-600">Наличными</h3>
              <p className="text-gray-600">
                Оплата наличными при получении заказа в магазине или курьеру при доставке.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100">
              <h3 className="text-xl font-medium mb-4 text-pink-600">Банковской картой</h3>
              <p className="text-gray-600">
                Безопасная оплата банковскими картами Visa, MasterCard, МИР.
              </p>
            </div>
          </div>
        </section>

        {/* Условия доставки */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-pink-500">Условия доставки</h2>
          <div className="bg-pink-50 p-6 rounded-lg">
            <ul className="space-y-3 text-gray-700">
              <li>• Бесплатная доставка при заказе от 5000 ₽</li>
              <li>• Срок доставки: 1-3 рабочих дня по Москве, 3-7 дней по России</li>
              <li>• Возможна срочная доставка в день заказа (за дополнительную плату)</li>
              <li>• Все товары надежно упакованы для безопасной транспортировки</li>
              <li>• При получении обязательно проверьте комплектность заказа</li>
            </ul>
          </div>
        </section>

        {/* Контакты */}
        <section className="mt-12 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100">
            <h3 className="text-xl font-medium mb-4 text-pink-600">Остались вопросы?</h3>
            <p className="text-gray-600 mb-4">
              Свяжитесь с нами любым удобным способом
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a 
                href="tel:+78001234567" 
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                📞 8 (800) 123-45-67
              </a>
              <a 
                href="mailto:info@tsarevna-fabrics.ru" 
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                ✉️ info@tsarevna-fabrics.ru
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 