# 🚀 Обновление PM2 продакшен сервера

## ✅ **Изменения запушены в GitHub!**

Все обновления (удаление поиска, статус "Удален", мобильная адаптация) теперь в репозитории.

---

## 📋 **ИНСТРУКЦИЯ ДЛЯ ОБНОВЛЕНИЯ PM2:**

### **1️⃣ Подключитесь к серверу**
```bash
ssh username@your-server-ip
# или локально, если PM2 запущен локально
```

### **2️⃣ Перейдите в папку проекта**
```bash
cd /path/to/tsarevna-fabrics-shop/website
# или туда, где находится ваш проект
```

### **3️⃣ Остановите PM2**
```bash
pm2 stop tsarevna-fabrics
# или 
pm2 stop all
```

### **4️⃣ Обновите код из GitHub**
```bash
git fetch origin
git reset --hard origin/master
git pull origin master
```

### **5️⃣ Установите зависимости (если нужно)**
```bash
npm install
```

### **6️⃣ Пересоберите проект**
```bash
npm run build
```

### **7️⃣ Запустите PM2 заново**
```bash
pm2 start tsarevna-fabrics
# или используйте ваш PM2 конфиг файл
pm2 start ecosystem.config.js
```

### **8️⃣ Проверьте статус**
```bash
pm2 status
pm2 logs tsarevna-fabrics
```

---

## 🔧 **Альтернативный способ (рекомендуемый):**

### **Вариант A: PM2 reload (zero-downtime)**
```bash
cd /path/to/project
git pull origin master
npm run build
pm2 reload tsarevna-fabrics
```

### **Вариант B: Полный restart**
```bash
cd /path/to/project
pm2 stop tsarevna-fabrics
git pull origin master
npm install
npm run build
pm2 start tsarevna-fabrics
```

---

## 🚨 **Если PM2 не обновляется:**

### **1️⃣ Удалите процесс и создайте заново:**
```bash
pm2 delete tsarevna-fabrics
pm2 start npm --name "tsarevna-fabrics" -- start
```

### **2️⃣ Очистите кэш Node.js:**
```bash
rm -rf node_modules/.cache
rm -rf .next
npm run build
pm2 restart tsarevna-fabrics
```

### **3️⃣ Проверьте переменные окружения:**
```bash
pm2 env 0  # показать переменные окружения
```

---

## 📱 **Что должно измениться после обновления:**

### **🔍 Поиск удален из шапки:**
- Откройте ваш сайт
- В шапке НЕТ поля поиска
- Только: Главная | Каталог | О нас | Контакты

### **🗑️ Статус "Удален" в админ панели:**
1. `/admin` → вкладка "Заказы"
2. "Просмотреть" любой заказ
3. В выпадающем списке: **"🗑️ Удален (не попадает в статистику)"**

### **📱 Мобильная адаптация:**
- Сайт адаптирован для мобильных устройств
- Responsive дизайн на всех страницах

### **🖼️ Изображения товаров:**
- Нет 404 ошибок
- Красивые fallback заглушки

---

## ⚡ **Быстрые команды для копирования:**

```bash
# Полное обновление
pm2 stop tsarevna-fabrics
cd /path/to/project
git pull origin master
npm run build
pm2 start tsarevna-fabrics

# Проверка
pm2 status
pm2 logs tsarevna-fabrics --lines 20
```

---

## 🔍 **Проверка обновления:**

### **1️⃣ Откройте сайт в браузере**
### **2️⃣ Нажмите Ctrl+F5 (принудительное обновление)**
### **3️⃣ Проверьте:**
- ❌ Поиска НЕТ в шапке
- ✅ Статус "Удален" ЕСТЬ в админ панели
- 📱 Мобильная версия работает

---

## 🆘 **Если нужна помощь:**

### **Логи PM2:**
```bash
pm2 logs tsarevna-fabrics
pm2 monit
```

### **Статус процессов:**
```bash
pm2 list
pm2 info tsarevna-fabrics
```

### **Перезапуск всех процессов:**
```bash
pm2 restart all
```

---

## ✅ **После выполнения команд выше:**
Ваш сайт будет обновлен до последней версии со всеми изменениями! 