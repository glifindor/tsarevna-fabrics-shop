# 🚀 Инструкция по деплою проекта "Царевна Ткани"

## Варианты деплоя

### 1. 🎯 Автоматический деплой (рекомендуется)

#### Для Windows (PowerShell):
```powershell
# Выполните в PowerShell от администратора
.\deploy.ps1
```

#### Для Linux/Mac:
```bash
# Сделайте скрипт исполняемым
chmod +x deploy.sh

# Запустите деплой
./deploy.sh
```

### 2. 📋 Ручной деплой

#### Шаг 1: Подготовка сервера
```bash
# Подключитесь к серверу
ssh root@212.69.87.22

# Установите Node.js (если не установлен)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Установите MongoDB (если не установлен)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Запустите MongoDB
systemctl start mongod
systemctl enable mongod

# Установите PM2 для управления процессами
npm install -g pm2
```

#### Шаг 2: Загрузка проекта
```bash
# Создайте директорию проекта
mkdir -p /var/www/tsarevna-fabrics
cd /var/www/tsarevna-fabrics

# Загрузите проект (один из способов):
# Вариант A: Через Git (если репозиторий публичный)
git clone https://github.com/your-username/tsarevna-fabrics.git .

# Вариант B: Загрузите архив вручную через SCP/FTP
# scp project.zip root@212.69.87.22:/var/www/tsarevna-fabrics/
# unzip project.zip
```

#### Шаг 3: Настройка окружения
```bash
# Создайте файл переменных окружения
cp .env.production .env

# Отредактируйте .env файл
nano .env

# Заполните обязательные переменные:
# - MONGODB_URI
# - NEXTAUTH_SECRET (минимум 32 символа)
# - JWT_SECRET (минимум 32 символа)
```

#### Шаг 4: Установка и сборка
```bash
# Установите зависимости
npm install --production

# Соберите проект
npm run build
```

#### Шаг 5: Запуск проекта
```bash
# Вариант A: Простой запуск
npm start

# Вариант B: С PM2 (рекомендуется)
pm2 start npm --name "tsarevna-fabrics" -- start
pm2 save
pm2 startup
```

### 3. 🐳 Деплой через Docker

#### Создайте Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./
RUN npm install --production

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Создайте docker-compose.yml:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/tsarevna-fabrics
    depends_on:
      - mongo
    volumes:
      - ./public/uploads:/app/public/uploads

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

#### Запуск через Docker:
```bash
# Соберите и запустите
docker-compose up -d

# Проверьте статус
docker-compose ps
```

## 🔧 Настройка веб-сервера

### Nginx (рекомендуется)
```nginx
server {
    listen 80;
    server_name 212.69.87.22;

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
        alias /var/www/tsarevna-fabrics/.next/static;
        expires 365d;
        access_log off;
    }

    location /uploads {
        alias /var/www/tsarevna-fabrics/public/uploads;
        expires 30d;
        access_log off;
    }
}
```

### Apache
```apache
<VirtualHost *:80>
    ServerName 212.69.87.22
    
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

## 🔐 Безопасность

1. **Обязательно измените секретные ключи**:
   - `NEXTAUTH_SECRET`
   - `JWT_SECRET`

2. **Настройте файрвол**:
   ```bash
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```

3. **Настройте SSL сертификат** (Let's Encrypt):
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com
   ```

## 📊 Мониторинг

### Проверка статуса
```bash
# Проверить процессы
pm2 status

# Логи приложения
pm2 logs tsarevna-fabrics

# Логи системы
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Автоматический перезапуск
```bash
# Настройка автозапуска PM2
pm2 startup
pm2 save
```

## 🛠️ Устранение неполадок

### Проблемы со сборкой
1. Проверьте версию Node.js: `node --version` (должна быть 18+)
2. Очистите кэш: `npm cache clean --force`
3. Удалите node_modules: `rm -rf node_modules && npm install`

### Проблемы с базой данных
1. Проверьте статус MongoDB: `systemctl status mongod`
2. Проверьте подключение: `mongo --eval "db.adminCommand('ismaster')"`

### Проблемы с портами
1. Проверьте занятые порты: `netstat -tulpn | grep :3000`
2. Убейте процесс: `pkill -f "next start"`

## 📞 Поддержка

После успешного деплоя ваш сайт будет доступен по адресу:
**http://212.69.87.22:3000**

Для продакшена рекомендуется:
1. Настроить домен
2. Установить SSL сертификат
3. Настроить регулярные бэкапы базы данных 