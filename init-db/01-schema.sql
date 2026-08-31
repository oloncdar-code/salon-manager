-- ============================================================
-- 1. ENUM типы
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'master', 'client');
CREATE TYPE appointment_status AS ENUM ('created', 'await_confirm', 'confirmed', 'completed', 'cancelled');

-- ============================================================
-- 2. Таблица users (Пользователи)
-- ============================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,                  -- необязательно
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,           -- используется для входа
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 3. Таблица masters (Мастера)
-- ============================================================

CREATE TABLE masters (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_master UNIQUE (user_id)
);

-- ============================================================
-- 4. Таблица clients (Клиенты)
-- ============================================================

CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_client UNIQUE (user_id)
);

-- ============================================================
-- 5. Таблица services (Услуги) – иерархическая
-- ============================================================

CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL,                   -- длительность в минутах
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 6. Таблица service_prices (Цены услуг – версионирование)
-- ============================================================

CREATE TABLE service_prices (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,   -- дата начала действия
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Частичный уникальный индекс: только одна активная цена на услугу
CREATE UNIQUE INDEX idx_active_price_per_service ON service_prices (service_id) WHERE is_active = true;

-- ============================================================
-- 7. Таблица materials (Материалы)
-- ============================================================

CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 8. Таблица material_prices (Цены материалов – версионирование)
-- ============================================================

CREATE TABLE material_prices (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,   -- дата начала действия
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Частичный уникальный индекс: только одна активная цена на материал
CREATE UNIQUE INDEX idx_active_price_per_material ON material_prices (material_id) WHERE is_active = true;

-- ============================================================
-- 9. Таблица service_materials (Связь услуга-материал)
-- ============================================================

CREATE TABLE service_materials (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_service_material UNIQUE (service_id, material_id)
);

-- ============================================================
-- 10. Таблица master_services (Связь мастер-услуги)
-- ============================================================

CREATE TABLE master_services (
    id BIGSERIAL PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_master_service UNIQUE (master_id, service_id)
);

-- ============================================================
-- 11. Таблица work_schedule (Рабочий график мастеров)
-- ============================================================

CREATE TABLE work_schedule (
    id BIGSERIAL PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIMESTAMP,                         -- может быть NULL (выходной)
    end_time TIMESTAMP,                           -- может быть NULL (выходной)
    break_start TIMESTAMP,
    break_end TIMESTAMP,
    is_working BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_master_date UNIQUE (master_id, date)
);

-- ============================================================
-- 12. Таблица appointments (Записи)
-- ============================================================

CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,   -- основная услуга
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status appointment_status NOT NULL DEFAULT 'created',
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT no_overlap UNIQUE (master_id, start_time)   -- один мастер – один слот
);

-- ============================================================
-- 13. Таблица appointment_services (Услуги в записи)
-- ============================================================

CREATE TABLE appointment_services (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    service_price DECIMAL(10,2),                   -- может быть NULL, если не определена
    material_id BIGINT REFERENCES materials(id) ON DELETE SET NULL,
    material_price DECIMAL(10,2),
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_appointment_service UNIQUE (appointment_id, service_id)
);

-- ============================================================
-- Индексы для производительности
-- ============================================================

-- Для быстрого поиска по времени и мастеру
CREATE INDEX idx_appointments_master_time ON appointments(master_id, start_time);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);

-- Для appointment_services
CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_material ON appointment_services(material_id);

-- Для work_schedule
CREATE INDEX idx_work_schedule_master_date ON work_schedule(master_id, date);

-- Для связей мастер-услуги и услуга-материал
CREATE INDEX idx_master_services_master ON master_services(master_id);
CREATE INDEX idx_service_materials_service ON service_materials(service_id);