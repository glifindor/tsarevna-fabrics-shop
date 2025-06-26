# 🧵 Царевна Ткани - Интернет-магазин тканей

Современный интернет-магазин тканей, созданный на Next.js 15 с полным функционалом электронной коммерции.

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)

## ✨ Особенности

### 🛍️ Для покупателей
- 📱 **Адаптивный дизайн** - отлично работает на всех устройствах
- 🔍 **Каталог товаров** с фильтрацией и поиском
- 🛒 **Корзина покупок** с сохранением между сессиями
- 💳 **Оформление заказов** с выбором способа оплаты
- 👤 **Личный кабинет** с историей заказов
- 🔐 **Безопасная аутентификация** через NextAuth.js

### 👨‍💼 Для администраторов
- 📊 **Админ-панель** с полной статистикой
- 📦 **Управление товарами** - добавление, редактирование, удаление
- 🏷️ **Управление категориями**
- 📋 **Управление заказами** с отслеживанием статусов
- 👥 **Управление пользователями**
- 📈 **Аналитика и отчеты**

### 🔧 Технические особенности
- ⚡ **Server-Side Rendering** для быстрой загрузки
- 🗄️ **MongoDB** для надежного хранения данных
- 🤖 **Telegram уведомления** о новых заказах
- 🔒 **Защищенные API маршруты**
- 📱 **PWA готовность**
- 🚀 **Оптимизированная производительность**

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 18+ 
- MongoDB 7.0+
- Telegram Bot Token (опционально)

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/glifindor/tsarevna-fabrics-shop.git
cd tsarevna-fabrics-shop
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
```bash
cp .env.example .env.local
```

Заполните файл `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/tsarevna-fabrics
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

4. **Запустите в режиме разработки**
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📁 Структура проекта

```
src/
├── app/                    # App Router страницы
│   ├── api/               # API маршруты
│   ├── admin/             # Админ-панель
│   ├── catalog/           # Каталог товаров
│   ├── profile/           # Личный кабинет
│   └── ...
├── components/            # React компоненты
│   ├── layout/           # Компоненты макета
│   └── ui/               # UI компоненты
├── context/              # React контексты
├── lib/                  # Утилиты и конфигурация
├── models/               # MongoDB модели
└── types/                # TypeScript типы
```

## 🛠️ Технологический стек

### Frontend
- **Next.js 15** - React фреймворк с App Router
- **TypeScript** - типизированный JavaScript
- **Tailwind CSS** - CSS фреймворк
- **React Hook Form** - управление формами
- **Zod** - валидация схем

### Backend
- **Next.js API Routes** - серверные маршруты
- **MongoDB** - NoSQL база данных
- **Mongoose** - ODM для MongoDB
- **NextAuth.js** - аутентификация
- **bcryptjs** - хеширование паролей

### Интеграции
- **Telegram Bot API** - уведомления о заказах
- **Multer** - загрузка файлов
- **Sharp** - обработка изображений

## 🚀 Развертывание

### Производственный сервер

1. **Клонируйте на сервер**
```bash
git clone https://github.com/glifindor/tsarevna-fabrics-shop.git
cd tsarevna-fabrics-shop
```

2. **Установите зависимости**
```bash
npm ci --only=production
```

3. **Настройте переменные**
```bash
cp .env.example .env.production
# Отредактируйте .env.production
```

4. **Соберите проект**
```bash
npm run build
```

5. **Запустите**
```bash
npm start
# или с PM2
pm2 start npm --name "tsarevna-fabrics" -- start
```

### Docker (опционально)

```bash
docker build -t tsarevna-fabrics .
docker run -p 3000:3000 tsarevna-fabrics
```

## 🔧 Конфигурация

### MongoDB
Создайте индексы для оптимальной производительности:
```javascript
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1 })
db.orders.createIndex({ userId: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

### Nginx (рекомендуется)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 API Документация

### Основные эндпоинты

- `GET /api/products` - получить все товары
- `GET /api/products/[slug]` - получить товар по slug
- `POST /api/cart/add` - добавить в корзину
- `POST /api/orders` - создать заказ
- `GET /api/admin/statistics` - статистика (админ)

Полная документация API доступна в файле `docs/api.md`.

## 🤝 Вклад в проект

1. Сделайте форк проекта
2. Создайте ветку для новой функции (`git checkout -b feature/new-feature`)
3. Зафиксируйте изменения (`git commit -am 'Add new feature'`)
4. Отправьте в ветку (`git push origin feature/new-feature`)
5. Создайте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для подробностей.

## 📞 Поддержка

- 🐛 **Баги**: [GitHub Issues](https://github.com/glifindor/tsarevna-fabrics-shop/issues)
- 💡 **Предложения**: [GitHub Discussions](https://github.com/glifindor/tsarevna-fabrics-shop/discussions)
- 📧 **Email**: support@tsarevna-fabrics.ru

## 🙏 Благодарности

- [Next.js](https://nextjs.org/) - за отличный фреймворк
- [Tailwind CSS](https://tailwindcss.com/) - за прекрасные стили
- [MongoDB](https://www.mongodb.com/) - за надежную базу данных

---

<div align="center">
  <p>Сделано с ❤️ для продажи качественных тканей</p>
  <p>⭐ Поставьте звезду, если проект понравился!</p>
</div>
