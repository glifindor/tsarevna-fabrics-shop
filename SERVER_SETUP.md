# 🔧 Настройка сервера для деплоя

## Первоначальная настройка сервера

### 1. Обновите систему и установите необходимые утилиты
```bash
# Обновите пакеты
apt update && apt upgrade -y

# Установите необходимые утилиты
apt install -y curl wget unzip git nano htop

# Установите Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Проверьте версии
node --version
npm --version
```

### 2. Установите MongoDB
```bash
# Добавьте ключ MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Добавьте репозиторий MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Обновите пакеты и установите MongoDB
apt-get update
apt-get install -y mongodb-org

# Запустите и включите автозапуск MongoDB
systemctl start mongod
systemctl enable mongod

# Проверьте статус
systemctl status mongod
```

### 3. Установите PM2 для управления процессами
```bash
npm install -g pm2
```

### 4. Настройте файрвол (опционально)
```bash
# Установите ufw если не установлен
apt install -y ufw

# Разрешите необходимые порты
ufw allow 22    # SSH
ufw allow 3000  # Наше приложение
ufw allow 80    # HTTP (если будете настраивать Nginx)
ufw allow 443   # HTTPS

# Включите файрвол
ufw --force enable
```

### 5. Создайте рабочую директорию
```bash
mkdir -p /var/www/tsarevna-fabrics
cd /var/www/tsarevna-fabrics
```

## Теперь можете продолжить деплой!

После выполнения этих команд вернитесь к инструкции в `QUICK_DEPLOY.md` и продолжите с шага 3 (распаковка архива).

### Быстрые команды для деплоя после настройки:
```bash
# Распакуйте архив
unzip /tmp/tsarevna-deploy.zip
rm /tmp/tsarevna-deploy.zip

# Создайте .env файл
cp .env.production .env
nano .env  # Отредактируйте переменные

# Установите зависимости
npm install --production

# Соберите проект
npm run build

# Запустите через PM2
pm2 start npm --name "tsarevna-fabrics" -- start
pm2 save
pm2 startup
```

### Проверка работы:
```bash
# Проверьте статус приложения
pm2 status

# Посмотрите логи
pm2 logs tsarevna-fabrics

# Проверьте, что сайт отвечает
curl http://localhost:3000
```

Ваш сайт будет доступен по адресу: **http://212.69.87.22:3000** 