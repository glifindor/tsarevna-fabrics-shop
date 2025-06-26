# 🚀 Руководство по развертыванию "Царевна Ткани"

## 📋 Подготовка к деплою

### 1. **Архивирование проекта**
```bash
# Исключаем ненужные файлы и создаем архив
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf tsarevna-shop.tar.gz .
```

### 2. **Проверка готовности проекта**
- ✅ Проект собирается без ошибок (`npm run build`)
- ✅ Настроены переменные окружения
- ✅ База данных настроена и доступна
- ✅ Все зависимости указаны в `package.json`

---

## 🌐 Способы развертывания

### 🔥 **Способ 1: Через SCP/SFTP (Рекомендуется)**

#### Шаг 1: Передача файлов
```bash
# Загрузка архива на сервер
scp tsarevna-shop.tar.gz username@your-server.com:/var/www/

# Или через SFTP
sftp username@your-server.com
put tsarevna-shop.tar.gz /var/www/
```

#### Шаг 2: Подключение к серверу
```bash
ssh username@your-server.com
```

#### Шаг 3: Распаковка и настройка
```bash
cd /var/www/
tar -xzf tsarevna-shop.tar.gz
mv tsarevna-shop.tar.gz-contents tsarevna-shop
cd tsarevna-shop

# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.example .env
nano .env  # Редактируем переменные

# Сборка проекта
npm run build

# Запуск
npm start
```

---

### 🐙 **Способ 2: Через Git (Удобно для обновлений)**

#### На сервере:
```bash
cd /var/www/
git clone https://github.com/yourusername/tsarevna-shop.git
cd tsarevna-shop

npm install
cp .env.example .env
nano .env  # Настраиваем переменные
npm run build
npm start
```

#### Для обновлений:
```bash
cd /var/www/tsarevna-shop
git pull origin main
npm install  # Если добавились зависимости
npm run build
pm2 restart tsarevna-shop  # Если используете PM2
```

---

### 🌍 **Способ 3: Через панель хостинга**

#### Для shared hosting:
1. Заходите в файловый менеджер/cPanel
2. Загружаете архив в `public_html`
3. Распаковываете через интерфейс
4. Устанавливаете зависимости через SSH или терминал

---

## ⚙️ Настройка окружения на сервере

### 1. **Переменные окружения (.env)**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/tsarevna-shop

# NextAuth.js
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key

# Telegram (опционально)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_ADMIN_CHAT_ID=your-chat-id

# Production
NODE_ENV=production
```

### 2. **Установка зависимостей сервера**
```bash
# Node.js (если не установлен)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB (если нужно)
sudo apt-get install -y mongodb

# PM2 для управления процессами
npm install -g pm2
```

---

## 🔧 Настройка веб-сервера

### **Nginx конфигурация**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы
    location /_next/static {
        alias /var/www/tsarevna-shop/.next/static;
        expires 365d;
        access_log off;
    }
}
```

### **Apache конфигурация**
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

---

## 🚀 Запуск приложения

### **Способ 1: PM2 (Рекомендуется)**
```bash
# Создание ecosystem файла
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'tsarevna-shop',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Запуск
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Способ 2: systemd service**
```bash
# Создание service файла
sudo nano /etc/systemd/system/tsarevna-shop.service
```

```ini
[Unit]
Description=Tsarevna Shop
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/tsarevna-shop
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Активация
sudo systemctl enable tsarevna-shop
sudo systemctl start tsarevna-shop
```

---

## 🛡️ Безопасность

### 1. **Настройка файервола**
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. **SSL сертификат (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. **Права доступа**
```bash
sudo chown -R www-data:www-data /var/www/tsarevna-shop
sudo chmod -R 755 /var/www/tsarevna-shop
```

---

## 📁 Структура на сервере
```
/var/www/tsarevna-shop/
├── .next/              # Собранное приложение
├── public/             # Статические файлы
├── src/                # Исходный код
├── .env                # Переменные окружения
├── package.json        # Зависимости
└── ecosystem.config.js # PM2 конфигурация
```

---

## 🔄 Обновление приложения

### **Через Git:**
```bash
cd /var/www/tsarevna-shop
git pull origin main
npm install
npm run build
pm2 restart tsarevna-shop
```

### **Через архив:**
```bash
# Бэкап текущей версии
cp -r /var/www/tsarevna-shop /var/www/tsarevna-shop-backup

# Загрузка нового архива
scp new-version.tar.gz server:/var/www/
cd /var/www/
tar -xzf new-version.tar.gz
cd tsarevna-shop
npm install
npm run build
pm2 restart tsarevna-shop
```

---

## 🔍 Мониторинг и логи

```bash
# Просмотр логов PM2
pm2 logs tsarevna-shop

# Мониторинг ресурсов
pm2 monit

# Системные логи
sudo journalctl -u tsarevna-shop -f

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🆘 Решение проблем

### **Проблема: Порт уже занят**
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### **Проблема: Нет доступа к MongoDB**
```bash
# Проверка статуса
sudo systemctl status mongodb
# Запуск
sudo systemctl start mongodb
```

### **Проблема: Недостаточно прав**
```bash
sudo chown -R $USER:$USER /var/www/tsarevna-shop
```

---

## 🎯 Чек-лист деплоя

- [ ] ✅ Архив создан и передан на сервер
- [ ] ✅ Проект распакован в `/var/www/tsarevna-shop`
- [ ] ✅ Node.js установлен (версия 18+)
- [ ] ✅ MongoDB установлен и запущен
- [ ] ✅ Переменные `.env` настроены
- [ ] ✅ Зависимости установлены (`npm install`)
- [ ] ✅ Проект собран (`npm run build`)
- [ ] ✅ Веб-сервер (Nginx/Apache) настроен
- [ ] ✅ PM2 или systemd service настроен
- [ ] ✅ Firewall настроен
- [ ] ✅ SSL сертификат установлен
- [ ] ✅ Домен указывает на сервер
- [ ] ✅ Сайт доступен по HTTPS

---

## 🎉 Готово!

После выполнения всех шагов ваш магазин "Царевна Ткани" будет доступен по адресу `https://yourdomain.com`! 