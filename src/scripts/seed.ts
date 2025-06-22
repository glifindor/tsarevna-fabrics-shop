import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dbConnect from '../lib/db';
import User from '../models/User';
import Product from '../models/Product';

// Категории тканей
const CATEGORIES = [
  'Хлопок',
  'Шелк',
  'Шерсть',
  'Лен',
  'Синтетика',
  'Смесовые ткани',
  'Подкладочные ткани',
  'Кружево',
  'Джинсовые ткани',
  'Трикотаж'
];

// Функция для генерации случайной цены
const getRandomPrice = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min) * 10;
};

// Функция для генерации случайного числа в заданном диапазоне
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Данные администратора
const adminUser = {
  name: 'Администратор',
  email: 'admin@tsarevna.ru',
  password: 'admin123',
  role: 'admin'
};

// Данные обычного пользователя
const regularUser = {
  name: 'Иван Иванов',
  email: 'user@example.com',
  password: 'password123',
  role: 'user'
};

// Массив данных для тканей
const fabricsData = [
  {
    name: 'Хлопок Премиум',
    articleNumber: 'CP001',
    description: 'Высококачественный хлопок премиум-класса. Идеален для пошива летней одежды, рубашек, платьев и детской одежды. Мягкий и приятный на ощупь, гипоаллергенный материал.',
    price: 850,
    composition: '100% хлопок',
    category: 'Хлопок',
    stock: 150,
    images: ['/cotton-premium.jpg']
  },
  {
    name: 'Лен Натуральный',
    articleNumber: 'LN002',
    description: 'Натуральный лен высшего качества. Экологичный материал с отличной воздухопроницаемостью. Подходит для пошива летней одежды, домашнего текстиля.',
    price: 1200,
    composition: '100% лен',
    category: 'Лен',
    stock: 80,
    images: ['/linen-natural.jpg']
  },
  {
    name: 'Шелк Натуральный',
    articleNumber: 'SK003',
    description: 'Роскошный натуральный шелк с характерным блеском. Идеален для пошива вечерних платьев, блузок, рубашек и аксессуаров.',
    price: 2300,
    composition: '100% шелк',
    category: 'Шелк',
    stock: 45,
    images: ['/silk-natural.jpg']
  },
  {
    name: 'Шерсть Мериноса',
    articleNumber: 'WL004',
    description: 'Высококачественная шерсть мериноса. Мягкая, теплая и приятная к телу. Подходит для пошива костюмов, пальто, платьев и юбок.',
    price: 1800,
    composition: '100% шерсть мериноса',
    category: 'Шерсть',
    stock: 60,
    images: ['/wool-merino.jpg']
  },
  {
    name: 'Вискоза Премиум',
    articleNumber: 'VS005',
    description: 'Мягкая и струящаяся вискоза премиального качества. Приятная на ощупь, хорошо драпируется. Идеальна для блузок, платьев и юбок.',
    price: 980,
    composition: '100% вискоза',
    category: 'Смесовые ткани',
    stock: 120,
    images: ['/viscose-premium.jpg']
  }
];

// Генерация дополнительных тканей
for (let i = 6; i <= 40; i++) {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const suffix = ['Премиум', 'Стандарт', 'Люкс', 'Классик', 'Элит', 'Эко', 'Натуральный', 'Особый', 'Мягкий', 'Плотный'];
  const randomSuffix = suffix[Math.floor(Math.random() * suffix.length)];
  
  fabricsData.push({
    name: `${category} ${randomSuffix}`,
    articleNumber: `TS${i.toString().padStart(3, '0')}`,
    description: `Качественная ткань ${category.toLowerCase()} ${randomSuffix.toLowerCase()}. Подходит для пошива различных изделий.`,
    price: getRandomPrice(500, 2500),
    composition: `${getRandomNumber(50, 100)}% ${category.toLowerCase()}`,
    category,
    stock: getRandomNumber(20, 200),
    images: [`/fabric-${i}.jpg`]
  });
}

// Функция для заполнения базы данных
async function seedDatabase() {
  try {
    // Подключение к базе данных
    await dbConnect();
    console.log('Подключение к базе данных установлено');

    // Очистка коллекций (опционально)
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Существующие данные удалены');

    // Создание администратора
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash(adminUser.password, salt);
    
    await User.create({
      name: adminUser.name,
      email: adminUser.email,
      password: hashedAdminPassword,
      role: adminUser.role
    });
    console.log('Администратор создан');

    // Создание обычного пользователя
    const hashedUserPassword = await bcrypt.hash(regularUser.password, salt);
    
    await User.create({
      name: regularUser.name,
      email: regularUser.email,
      password: hashedUserPassword,
      role: regularUser.role
    });
    console.log('Обычный пользователь создан');

    // Создание товаров
    await Product.insertMany(fabricsData);
    console.log(`${fabricsData.length} тканей добавлено в базу данных`);

    console.log('База данных успешно заполнена');
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
  } finally {
    // Закрываем подключение к базе данных
    await mongoose.disconnect();
    console.log('Подключение к базе данных закрыто');
  }
}

// Запуск функции заполнения базы данных
seedDatabase();
