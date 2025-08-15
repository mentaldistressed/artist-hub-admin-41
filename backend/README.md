# User Management System

Полная система управления пользователями с аутентификацией, авторизацией и управлением сессиями.

## Особенности

### 🔐 Безопасность
- Хеширование паролей с bcrypt (12 раундов)
- JWT токены (access + refresh)
- Защита от брутфорса с блокировкой аккаунта
- Двухфакторная аутентификация (TOTP)
- Rate limiting для API endpoints
- Безопасные HTTP заголовки (Helmet.js)

### 👤 Управление пользователями
- Регистрация с валидацией email
- Подтверждение email через токен
- Восстановление пароля
- Управление профилем пользователя
- Деактивация аккаунтов

### 🔄 Управление сессиями
- Хранение сессий в Redis
- Ограничение количества активных сессий
- Автоматическое продление сессий
- Завершение всех сессий пользователя
- Опция "Запомнить меня"

### 📧 Email уведомления
- Подтверждение регистрации
- Восстановление пароля
- Уведомления о входе в систему
- Настраиваемые шаблоны

### 📊 Логирование и мониторинг
- Структурированное логирование (Winston)
- Логи безопасности
- Мониторинг попыток входа
- Health check endpoint

## Технологический стек

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL с Knex.js ORM
- **Cache/Sessions**: Redis
- **Authentication**: JWT, bcrypt, Speakeasy (2FA)
- **Email**: Nodemailer
- **Logging**: Winston
- **Security**: Helmet, express-rate-limit

## Установка и настройка

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка окружения
Скопируйте `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

### 3. Настройка базы данных
```bash
# Создайте базу данных PostgreSQL
createdb user_management

# Запустите миграции
npm run migrate
```

### 4. Настройка Redis
Убедитесь, что Redis запущен:
```bash
redis-server
```

### 5. Запуск приложения
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Аутентификация

#### POST /api/auth/register
Регистрация нового пользователя.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_verified": false
    }
  }
}
```

#### POST /api/auth/login
Вход в систему.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": false,
  "two_factor_code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_verified": true,
      "two_factor_enabled": false
    },
    "tokens": {
      "access_token": "jwt_token",
      "refresh_token": "jwt_refresh_token"
    }
  }
}
```

#### POST /api/auth/refresh-token
Обновление access токена.

**Body:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

#### POST /api/auth/logout
Выход из системы (требует авторизации).

#### POST /api/auth/logout-all
Выход из всех устройств (требует авторизации).

### Управление аккаунтом

#### POST /api/auth/verify-email
Подтверждение email.

**Body:**
```json
{
  "token": "verification_token"
}
```

#### POST /api/auth/request-password-reset
Запрос восстановления пароля.

**Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password
Сброс пароля.

**Body:**
```json
{
  "token": "reset_token",
  "password": "NewSecurePass123!"
}
```

#### GET /api/auth/profile
Получение профиля пользователя (требует авторизации).

### Двухфакторная аутентификация

#### POST /api/auth/setup-2fa
Настройка 2FA (требует авторизации и подтвержденный email).

#### POST /api/auth/enable-2fa
Включение 2FA (требует авторизации и подтвержденный email).

**Body:**
```json
{
  "secret": "base32_secret",
  "token": "123456"
}
```

#### POST /api/auth/disable-2fa
Отключение 2FA (требует авторизации и подтвержденный email).

**Body:**
```json
{
  "password": "current_password"
}
```

## Схема базы данных

### Таблица users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица verification_tokens
```sql
CREATE TABLE verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email_verification' | 'password_reset'
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Архитектурные решения

### 1. Безопасность паролей
- Используется bcrypt с 12 раундами хеширования
- Валидация сложности пароля на уровне API
- Автоматическая блокировка после 5 неудачных попыток

### 2. JWT токены
- Access токены живут 15 минут
- Refresh токены живут 7 дней (30 дней с "запомнить меня")
- Токены содержат session ID для управления сессиями

### 3. Управление сессиями
- Сессии хранятся в Redis для быстрого доступа
- Ограничение до 5 активных сессий на пользователя
- Автоматическое удаление старых сессий

### 4. Rate Limiting
- Глобальный лимит: 100 запросов за 15 минут
- Регистрация: 5 попыток за 15 минут
- Вход: 10 попыток за 15 минут
- Восстановление пароля: 3 попытки в час

### 5. Email верификация
- Токены действуют 24 часа для подтверждения email
- Токены действуют 1 час для сброса пароля
- Автоматическая очистка истекших токенов

### 6. Двухфакторная аутентификация
- Использует TOTP (Time-based One-Time Password)
- Совместимо с Google Authenticator, Authy и др.
- QR код для простой настройки

## Безопасность (OWASP)

### Реализованные меры:
- ✅ Хеширование паролей (bcrypt)
- ✅ Защита от брутфорса
- ✅ Rate limiting
- ✅ Валидация входных данных
- ✅ Безопасные HTTP заголовки
- ✅ CORS настройки
- ✅ JWT с коротким временем жизни
- ✅ Логирование событий безопасности
- ✅ Двухфакторная аутентификация
- ✅ Защита от SQL инъекций (ORM)

### Рекомендации для production:
1. Используйте HTTPS
2. Настройте мониторинг логов
3. Регулярно обновляйте зависимости
4. Используйте секреты из переменных окружения
5. Настройте backup базы данных
6. Используйте CDN для статических файлов

## Тестирование

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage
```

## Мониторинг

### Health Check
```bash
GET /health
```

### Логи
- `logs/combined.log` - все логи
- `logs/error.log` - только ошибки
- `logs/security.log` - события безопасности

## Развертывание

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: user_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Лицензия

MIT License