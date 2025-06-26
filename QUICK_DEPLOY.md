# 🚀 Быстрый деплой на сервер 212.69.87.22

## Архив готов к загрузке!
✅ **tsarevna-deploy.zip** - готов к загрузке на сервер

## 📋 Пошаговая инструкция:

### 1. Загрузите архив на сервер
```bash
# Через SCP (если есть SSH доступ)
scp tsarevna-deploy.zip root@212.69.87.22:/tmp/

# Или загрузите через FTP/SFTP клиент (FileZilla, WinSCP)
```

### 2. Подключитесь к серверу
```bash
ssh root@212.69.87.22
```

### 3. Выполните команды на сервере
```bash
# Перейдите в рабочую директорию
cd /var/www
mkdir -p tsarevna-fabrics
cd tsarevna-fabrics

# Распакуйте архив
unzip /tmp/tsarevna-deploy.zip
rm /tmp/tsarevna-deploy.zip

# Создайте файл окружения
cp .env.production .env

# ВАЖНО: Отредактируйте .env файл!
nano .env
```

### 4. Заполните переменные окружения в .env:
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tsarevna-fabrics
NEXTAUTH_URL=http://212.69.87.22:3000
NEXTAUTH_SECRET=ваш-секретный-ключ-минимум-32-символа
JWT_SECRET=ваш-jwt-секрет-минимум-32-символа
```

### 5. Установите зависимости и соберите проект
```bash
# Установите Node.js (если не установлен)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Установите зависимости
npm install --production

# Соберите проект
npm run build

# Запустите проект
npm start
```

### 6. Для продакшена (рекомендуется PM2)
```bash
# Установите PM2
npm install -g pm2

# Запустите проект через PM2
pm2 start npm --name "tsarevna-fabrics" -- start
pm2 save
pm2 startup
```

## 🌐 Результат
Сайт будет доступен по адресу: **http://212.69.87.22:3000**

## 🔧 Если что-то не работает:

### Проблемы с MongoDB:
```bash
# Установите MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

### Проблемы с портами:
```bash
# Проверьте, что порт 3000 свободен
netstat -tulpn | grep :3000

# Убейте процесс, если нужно
pkill -f "next start"
```

### Проблемы со сборкой:
```bash
# Очистите кэш
npm cache clean --force
rm -rf node_modules
npm install
```

## 📞 Нужна помощь?
Если возникли проблемы, проверьте:
1. Версию Node.js: `node --version` (должна быть 18+)
2. Логи: `pm2 logs tsarevna-fabrics`
3. Статус MongoDB: `systemctl status mongod` 