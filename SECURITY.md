# Рекомендации по безопасности

## Переменные окружения

Убедитесь, что установлены все необходимые переменные окружения в файле `.env.local`:

```bash
# База данных
MONGODB_URI=mongodb://localhost:27017/tsarevna-fabrics

# JWT секрет (сгенерируйте случайную строку длиной минимум 32 символа)
JWT_SECRET=your-super-secure-jwt-secret-here-32-chars-min

# NextAuth секрет (сгенерируйте случайную строку)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Telegram (для уведомлений о заказах)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_ADMIN_CHAT_ID=your-telegram-chat-id
```

## Генерация секретных ключей

Для генерации безопасных секретных ключей используйте:

```bash
# Для JWT_SECRET и NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Или
openssl rand -hex 32
```

## Проверка безопасности перед деплоем

### 1. Переменные окружения
- [ ] Все секретные ключи установлены и не содержат значения по умолчанию
- [ ] JWT_SECRET не содержит 'fallback-secret-key'
- [ ] NEXTAUTH_SECRET установлен и уникален

### 2. База данных
- [ ] MongoDB подключение защищено паролем
- [ ] Используется SSL/TLS для подключения к БД
- [ ] Созданы индексы для часто запрашиваемых полей

### 3. API Routes
- [ ] Все административные роуты защищены проверкой роли
- [ ] Входные данные валидируются
- [ ] Ошибки не раскрывают чувствительную информацию

### 4. Файлы загрузки
- [ ] Проверяется тип загружаемых файлов
- [ ] Ограничен размер файлов
- [ ] Файлы сохраняются вне web-директории или с проверкой доступа

### 5. Общие рекомендации
- [ ] HTTPS используется в продакшене
- [ ] Настроены правильные CORS заголовки
- [ ] Логирование не содержит чувствительных данных
- [ ] Регулярно обновляются зависимости

## Мониторинг

Рекомендуется настроить мониторинг для:
- Необычной активности входа в систему
- Множественных неудачных попыток аутентификации
- Подозрительных запросов к API
- Ошибок сервера

## Контакты

При обнаружении уязвимостей обращайтесь к администраторам проекта. 