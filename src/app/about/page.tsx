"use client";

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Декоративные элементы сверху */}
      <div className="relative mb-8">
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
      </div>
      
      <div className="text-center mb-12 relative">
        <h1 className="text-4xl font-bold mb-4 text-brand-primary relative inline-block">
          О компании &ldquo;Царевна Швеяна&rdquo;
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl">👑</span>
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto"></div>
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-8 mb-10 border border-pink-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200/40 to-transparent rounded-bl-3xl"></div>
        <h2 className="text-2xl font-semibold mb-6 text-brand-primary relative inline-block">
          Наша история
          <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></span>
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Компания &ldquo;Царевна Швеяна&rdquo; начала свою деятельность в 2018 году как небольшой семейный магазин тканей. 
          За годы работы мы выросли в одного из ведущих поставщиков высококачественных тканей для рукоделия, 
          творчества и профессионального пошива.
        </p>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Наша команда состоит из профессионалов, влюбленных в свое дело и всегда готовых помочь каждому клиенту 
          подобрать идеальную ткань для любого проекта.
        </p>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-200/40 to-transparent rounded-tr-3xl"></div>
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-8 mb-10 border border-pink-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200/40 to-transparent rounded-bl-3xl"></div>
        <h2 className="text-2xl font-semibold mb-6 text-brand-primary relative inline-block">
          Наша миссия
          <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></span>
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Мы стремимся предоставлять нашим клиентам только самые качественные ткани от лучших производителей 
          со всего мира по доступным ценам.
        </p>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Наша цель — вдохновлять людей на творчество и помогать воплощать их идеи в жизнь, 
          предоставляя лучшие материалы и профессиональную поддержку.
        </p>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-200/40 to-transparent rounded-tr-3xl"></div>
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-8 mb-10 border border-pink-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200/40 to-transparent rounded-bl-3xl"></div>
        <h2 className="text-2xl font-semibold mb-6 text-brand-primary relative inline-block">
          Наши ценности
          <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></span>
        </h2>
        <ul className="space-y-4 text-gray-700">
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">✦</span>
            <div>
              <span className="font-medium text-brand-primary">Качество</span> — мы тщательно отбираем каждую ткань в нашем ассортименте
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">✦</span>
            <div>
              <span className="font-medium text-brand-primary">Честность</span> — мы всегда предоставляем точную информацию о наших товарах
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">✦</span>
            <div>
              <span className="font-medium text-brand-primary">Клиентоориентированность</span> — ваше удовлетворение является нашим приоритетом
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">✦</span>
            <div>
              <span className="font-medium text-brand-primary">Развитие</span> — мы постоянно расширяем ассортимент и улучшаем сервис
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">✦</span>
            <div>
              <span className="font-medium text-brand-primary">Экологичность</span> — мы стремимся работать с поставщиками, уважающими окружающую среду
            </div>
          </li>
        </ul>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-200/40 to-transparent rounded-tr-3xl"></div>
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-8 mb-10 border border-pink-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200/40 to-transparent rounded-bl-3xl"></div>
        <h2 className="text-2xl font-semibold mb-6 text-brand-primary relative inline-block">
          Наши преимущества
          <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-pink-100 rounded-xl p-6 bg-gradient-to-br from-pink-50/50 to-white transition-transform hover:-translate-y-1 hover:shadow-soft">
            <h3 className="font-bold text-lg mb-3 text-brand-primary">✨ Широкий ассортимент</h3>
            <p className="text-gray-700">Более 1000 видов тканей различных составов, цветов и фактур</p>
          </div>
          <div className="border border-pink-100 rounded-xl p-6 bg-gradient-to-br from-pink-50/50 to-white transition-transform hover:-translate-y-1 hover:shadow-soft">
            <h3 className="font-bold text-lg mb-3 text-brand-primary">✨ Гарантия качества</h3>
            <p className="text-gray-700">Мы проверяем каждую партию товара перед отправкой клиенту</p>
          </div>
          <div className="border border-pink-100 rounded-xl p-6 bg-gradient-to-br from-pink-50/50 to-white transition-transform hover:-translate-y-1 hover:shadow-soft">
            <h3 className="font-bold text-lg mb-3 text-brand-primary">✨ Быстрая доставка</h3>
            <p className="text-gray-700">Отправляем заказы в день оформления при наличии товара на складе</p>
          </div>
          <div className="border border-pink-100 rounded-xl p-6 bg-gradient-to-br from-pink-50/50 to-white transition-transform hover:-translate-y-1 hover:shadow-soft">
            <h3 className="font-bold text-lg mb-3 text-brand-primary">✨ Профессиональные консультации</h3>
            <p className="text-gray-700">Наши специалисты всегда готовы помочь с выбором ткани для вашего проекта</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-200/40 to-transparent rounded-tr-3xl"></div>
      </div>
      
      <div className="mt-10 text-center">
        <Link 
          href="/" 
          className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600 transition shadow-soft hover:shadow-md"
        >
          <FiArrowLeft className="mr-2" />
          Вернуться на главную
        </Link>
      </div>
      
      {/* Декоративные элементы снизу */}
      <div className="relative mt-12">
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 mb-1"></div>
        <div className="w-full h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200"></div>
      </div>
    </div>
  );
}
