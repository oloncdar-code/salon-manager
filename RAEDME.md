[![Backend CI](https://github.com/oloncdar-code/salon-manager/actions/workflows/backend.yml/badge.svg)](https://github.com/oloncdar-code/salon-manager/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/oloncdar-code/salon-manager/actions/workflows/frontend.yml/badge.svg)](https://github.com/oloncdar-code/salon-manager/actions/workflows/frontend.yml)
[![codecov](https://codecov.io/gh/oloncdar-code/salon-manager/branch/main/graph/badge.svg)](https://codecov.io/gh/oloncdar-code/salon-manager)

# Система управления записью клиентов для салонов красоты

Веб-приложение для управления записью клиентов в небольших сервисных компаниях (салоны красоты, парикмахерские, массажные кабинеты, косметологические студии и др.). Позволяет клиентам записываться на услуги, мастерам – управлять своим расписанием, а администраторам – контролировать весь процесс.

## Основные возможности

- **Управление записями:** создание, просмотр, редактирование, изменение статуса (создана → ожидает подтверждения → подтверждена → выполнена → отменена).
- **Управление клиентами:** поиск по телефону, создание клиента на лету при записи.
- **Управление мастерами:** CRUD, привязка к услугам, рабочий график (календарь и общая таблица).
- **Управление услугами:** иерархическая структура (категории → дочерние услуги), версионирование цен.
- **Управление материалами:** CRUD, привязка к услугам, версионирование цен.
- **Канбан-доска:** визуальное управление записями по статусам с drag-and-drop.
- **Ролевая модель:** администратор, мастер, клиент (с разным набором функций).

## Технологический стек

### Бэкенд
- [NestJS](https://nestjs.com/) (TypeScript)
- [TypeORM](https://typeorm.io/) + PostgreSQL
- [JWT](https://jwt.io/) + Passport.js (аутентификация)
- [Swagger](https://swagger.io/) (документация API)
- [Jest](https://jestjs.io/) + [Supertest](https://github.com/visionmedia/supertest) (тестирование)

### Фронтенд
- [Vue 3](https://vuejs.org/) (Composition API)
- [Vite](https://vitejs.dev/) (сборка)
- [Pinia](https://pinia.vuejs.org/) (управление состоянием)
- [Vue Router](https://router.vuejs.org/) (маршрутизация)
- [Tailwind CSS](https://tailwindcss.com/) (стилизация)
- [Vitest](https://vitest.dev/) + [Vue Test Utils](https://test-utils.vuejs.org/) (тестирование)

## Требования

- Node.js v18+
- PostgreSQL (или Docker)
- Git

## Установка и запуск

### 1. Клонировать репозиторий

git clone // НАДО НЕ ЗАБЫТЬ ДОБАВИТЬ!!!
cd salon-manager

### 2. Настройка базы данных (через Docker)

docker run --name salon-postgres -e POSTGRES_PASSWORD=salon_pass -e POSTGRES_USER=salon_admin -e POSTGRES_DB=salon_db -p 5433:5432 -d postgres:15-alpine

### 3. Настройка переменных окружения

backend/.env

DB_HOST=localhost
DB_PORT=5433
DB_USER=salon_admin
DB_PASSWORD=salon_pass
DB_NAME=salon_db
DATABASE_URL=postgresql://salon_admin:salon_pass@localhost:5433/salon_db
JWT_SECRET=your-secret-key

frontend/.env

VITE_API_URL=/api

### 4. Установка зависимостей и запуск бэкенда

cd backend
npm install
npm run start:dev

Бэкенд будет доступен по адресу http://localhost:5174.

### 5. Запуск фронтенда

cd frontend
npm install
npm run dev

Фронтенд будет доступен по адресу http://localhost:5173.

### 6. Наполнение базы данных тестовыми данными (seed)

Для быстрого старта выполните seed-скрипт (из папки backend):

npm run seed

Это создаст:

Администратора (+79990001122 / admin123)
Двух мастеров
Двух клиентов
Две категории услуг с дочерними услугами и ценами
Материалы и их цены
Рабочие графики на несколько дней
Тестовые записи

## Тестирование

### Бэкенд (e2e-тесты)
cd backend
npm run test:e2e

Для запуска в режиме отслеживания изменений:
npm run test:e2e -- --watch

### Фронтенд (unit-тесты)
cd frontend
npm run test


## Основные пользовательские сценарии

Администратор:
-Управление услугами, мастерами, материалами.
-Просмотр и редактирование всех записей.
-Управление рабочим графиком мастеров (календарь и общая таблица).
-Канбан-доска для визуального управления статусами записей.

Мастер:
-Просмотр своих записей.
-Подтверждение, отмена, перенос записей.
-Редактирование только своего рабочего графика (календарь).

Клиент (осталось на развитие, не вошло в MVP):
-Запись через публичную форму.
-Личный кабинет с историей записей (в разработке).


## Структура проекта

salon-manager/
├── backend/               # NestJS бэкенд
│   ├── src/
│   │   ├── modules/       # модули (auth, users, masters, services, ...)
│   │   ├── entities/      # TypeORM сущности
│   │   └── seed.ts        # скрипт заполнения БД
│   ├── test/              # e2e-тесты
│   └── package.json
├── frontend/              # Vue 3 фронтенд
│   ├── src/
│   │   ├── api/           # HTTP-клиенты
│   │   ├── components/    # UI-компоненты
│   │   ├── stores/        # Pinia сторы
│   │   ├── views/         # Страницы
│   │   └── utils/         # Утилиты (форматирование дат и т.п.)
│   └── package.json
└── README.md

# Лицензия 
Учебный проект. Все права защищены.

# Разработано в рамках учебного проекта.