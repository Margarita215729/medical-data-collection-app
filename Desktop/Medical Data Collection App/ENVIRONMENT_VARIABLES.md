# 🔧 Переменные окружения для Medical Data Collection App

## 📋 Обязательные переменные

### Supabase Configuration
```env
# URL вашего Supabase проекта
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Публичный анонимный ключ Supabase
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Альтернативные названия для серверной части
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Сервисный ключ Supabase (для серверных операций)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Строка подключения к базе данных
SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.your-project-id.supabase.co:5432/postgres
```

## 🔧 Дополнительные переменные

### AI/ML функции
```env
# GitHub токен для доступа к AI моделям
GITHUB_TOKEN=ghp_your_github_token_here
```

### Конфигурация развертывания
```env
# Режим окружения
NODE_ENV=development

# URL приложения
APP_URL=https://your-app-domain.com
```

### Безопасность
```env
# JWT секрет
JWT_SECRET=your-super-secret-jwt-key-here

# Ключ шифрования
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Мониторинг
```env
# Sentry для отслеживания ошибок
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Google Analytics
GA_TRACKING_ID=G-XXXXXXXXXX
```

### Email конфигурация
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Файловое хранилище (AWS S3)
```env
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## 📝 Инструкции по настройке

### 1. Локальная разработка
1. Скопируйте этот файл в `.env.local`
2. Заполните необходимые переменные
3. Никогда не коммитьте `.env.local` в git

### 2. Получение Supabase ключей
1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в Settings → API
4. Скопируйте:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. GitHub токен (для AI функций)
1. Перейдите в [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Создайте новый токен
3. Выберите scopes: `public_repo`, `read:user`
4. Скопируйте токен в `GITHUB_TOKEN`

## ⚠️ Важные замечания

- **VITE_** префикс означает, что переменная доступна в клиентском коде
- Переменные без **VITE_** доступны только на сервере
- Никогда не коммитьте секретные ключи в репозиторий
- Для продакшена настройте переменные в вашей платформе хостинга

## 🚀 Быстрый старт

Минимальная конфигурация для запуска:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
