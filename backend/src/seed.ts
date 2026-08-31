import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // Очистка таблиц (порядок важен – сначала дочерние)
  await dataSource.query('TRUNCATE TABLE appointment_services CASCADE;');
  await dataSource.query('TRUNCATE TABLE appointments CASCADE;');
  await dataSource.query('TRUNCATE TABLE work_schedule CASCADE;');
  await dataSource.query('TRUNCATE TABLE service_materials CASCADE;');
  await dataSource.query('TRUNCATE TABLE master_services CASCADE;');
  await dataSource.query('TRUNCATE TABLE service_prices CASCADE;');
  await dataSource.query('TRUNCATE TABLE services CASCADE;');
  await dataSource.query('TRUNCATE TABLE masters CASCADE;');
  await dataSource.query('TRUNCATE TABLE clients CASCADE;');
  await dataSource.query('TRUNCATE TABLE materials CASCADE;');
  await dataSource.query('TRUNCATE TABLE material_prices CASCADE;');
  await dataSource.query('TRUNCATE TABLE users CASCADE;');

  // Сброс последовательностей (чтобы ID начинались с 1)
  await dataSource.query('ALTER SEQUENCE users_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE clients_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE masters_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE services_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE service_prices_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE materials_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE material_prices_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE master_services_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE service_materials_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE work_schedule_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE appointments_id_seq RESTART WITH 1;');
  await dataSource.query('ALTER SEQUENCE appointment_services_id_seq RESTART WITH 1;');

  // ===== Вставка данных =====

  // 1. users
  await dataSource.query(`
    INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active, created_at, updated_at) VALUES
    (32, NULL, '$2b$10$YgYkuiLbPE7awUOeNvQ72OYxma6lWOO7j8SJk58znrTaZGjk2SBNK', 'admin', 'Администратор', '+79990001122', true, '2026-08-31 19:53:08.602', '2026-08-31 19:53:08.602'),
    (33, NULL, '', 'client', 'Клиент Тест 1', '+79990001133', true, '2026-08-31 19:53:09.029', '2026-08-31 19:53:09.029'),
    (34, NULL, NULL, 'client', 'Клиент Тест 2', '+79990004455', true, '2026-08-31 19:53:09.421', '2026-08-31 19:53:09.421'),
    (35, NULL, '$2a$12$zx6GR8Q8jN7Ek.p73UaEduVthLtcOg6MYn7m3sCSypx.lfkjvmL/W', 'master', 'Мастер Лечебный массаж', '+79990005566', true, '2026-08-31 19:53:09.421', '2026-08-31 19:53:09.421'),
    (36, NULL, '$2a$12$zx6GR8Q8jN7Ek.p73UaEduVthLtcOg6MYn7m3sCSypx.lfkjvmL/W', 'master', 'Мастер Лазерная эпиляция', '+79990006677', true, '2026-08-31 23:47:21.462', '2026-08-31 23:47:21.462');
  `);

  // 2. clients
  await dataSource.query(`
    INSERT INTO clients (id, user_id, birth_date, is_active, created_at, updated_at) VALUES
    (24, 33, NULL, true, '2026-08-31 19:53:08.635', '2026-08-31 19:53:08.635'),
    (25, 34, NULL, true, '2026-08-31 19:53:09.431', '2026-08-31 19:53:09.431');
  `);

  // 3. masters
  await dataSource.query(`
    INSERT INTO masters (id, user_id, bio, rating, is_active, created_at, updated_at) VALUES
    (11, 35, 'Опытный мастер', 4.80, true, '2026-08-31 19:53:08.747', '2026-08-31 19:53:08.747'),
    (12, 36, 'Опытный мастер', 4.90, true, '2026-08-31 19:53:08.747', '2026-08-31 19:53:08.747');
  `);

  // 4. services
  await dataSource.query(`
    INSERT INTO services (id, parent_id, name, short_name, duration, is_active, created_at, updated_at) VALUES
    (26, NULL, 'Лечебный массаж', 'Лечебный массаж', 60, true, '2026-08-31 19:53:08.770', '2026-08-31 19:53:08.770'),
    (27, 26, 'Шейный отдел', 'Шейный отдел', 25, true, '2026-08-31 19:53:08.811', '2026-08-31 19:53:08.811'),
    (28, 26, 'Позвоночный отдел', 'Позвоночный отдел', 45, true, '2026-08-31 19:53:08.811', '2026-08-31 19:53:08.811'),
    (29, NULL, 'Лазерная эпиляция', 'Лазерная эпиляция', 60, true, '2026-08-31 19:53:08.770', '2026-08-31 19:53:08.770'),
    (30, 29, 'Руки (до логтя)', 'Руки (до логтя)', 25, true, '2026-08-31 19:53:08.811', '2026-08-31 19:53:08.811'),
    (31, 29, 'Ноги (до колена)', 'Ноги (до колена)', 45, true, '2026-08-31 19:53:08.811', '2026-08-31 19:53:08.811');
  `);

  // 5. service_prices
  await dataSource.query(`
    INSERT INTO service_prices (id, service_id, price, is_active, created_at, updated_at) VALUES
    (34, 28, 2000.00, false, '2026-08-31 19:53:08.785', '2026-08-31 19:53:09.208'),
    (35, 27, 1500.00, true, '2026-08-31 19:53:08.827', '2026-08-31 19:53:08.827'),
    (36, 30, 2500.00, true, '2026-08-31 19:53:09.214', '2026-08-31 19:53:09.214'),
    (37, 31, 2500.00, true, '2026-08-31 19:53:09.214', '2026-08-31 19:53:09.214');
  `);

  // 6. master_services
  await dataSource.query(`
    INSERT INTO master_services (id, master_id, service_id, is_active, created_at, updated_at) VALUES
    (8, 11, 26, true, '2026-08-31 19:53:08.839', '2026-08-31 19:53:08.839'),
    (9, 12, 29, true, '2026-08-31 19:53:08.839', '2026-08-31 19:53:08.839');
  `);

  // 7. materials
  await dataSource.query(`
    INSERT INTO materials (id, name, short_name, is_active, created_at, updated_at) VALUES
    (19, 'Масло массажное', 'Масло массажное', true, '2026-08-31 19:53:08.858', '2026-08-31 19:53:08.858'),
    (20, 'Крем успокаивающий', 'Крем успокаивающий', true, '2026-08-31 19:53:09.250', '2026-08-31 19:53:09.250');
  `);

  // 8. material_prices
  await dataSource.query(`
    INSERT INTO material_prices (id, material_id, price, is_active, created_at, updated_at) VALUES
    (19, 19, 300.00, true, '2026-08-31 19:53:08.874', '2026-08-31 19:53:08.874'),
    (20, 20, 200.00, true, '2026-08-31 19:53:09.260', '2026-08-31 19:53:09.260');
  `);

  // 9. service_materials
  await dataSource.query(`
    INSERT INTO service_materials (id, service_id, material_id, is_active, created_at, updated_at) VALUES
    (11, 27, 19, true, '2026-08-31 19:53:08.899', '2026-08-31 19:53:08.899'),
    (12, 28, 19, true, '2026-08-31 19:53:08.899', '2026-08-31 19:53:08.899'),
    (13, 30, 20, true, '2026-08-31 19:53:08.899', '2026-08-31 19:53:08.899'),
    (14, 31, 20, true, '2026-08-31 19:53:08.899', '2026-08-31 19:53:08.899');
  `);

  // 10. work_schedule
  await dataSource.query(`
    INSERT INTO work_schedule (id, master_id, date, start_time, end_time, break_start, break_end, is_working, created_at, updated_at) VALUES
    (9, 11, '2026-08-31', '2026-08-31 05:00:00.000', '2026-08-31 14:00:00.000', NULL, NULL, false, '2026-08-31 19:53:08.929', '2026-08-31 19:53:09.347'),
    (30, 11, '2026-09-01', '2026-09-01 05:00:00.000', '2026-09-01 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (31, 12, '2026-09-01', '2026-09-01 05:00:00.000', '2026-09-01 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (32, 11, '2026-09-02', '2026-09-02 05:00:00.000', '2026-09-02 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (33, 12, '2026-09-02', '2026-09-02 05:00:00.000', '2026-09-02 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (34, 11, '2026-09-03', '2026-09-03 05:00:00.000', '2026-09-03 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (35, 12, '2026-09-03', '2026-09-03 05:00:00.000', '2026-09-03 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (36, 11, '2026-09-04', '2026-09-04 05:00:00.000', '2026-09-04 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (37, 12, '2026-09-04', '2026-09-04 05:00:00.000', '2026-09-04 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (38, 11, '2026-09-05', '2026-09-05 05:00:00.000', '2026-09-05 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (39, 12, '2026-09-05', '2026-09-05 05:00:00.000', '2026-09-05 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (40, 11, '2026-09-06', '2026-09-06 05:00:00.000', '2026-09-06 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (41, 12, '2026-09-06', '2026-09-06 05:00:00.000', '2026-09-06 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (42, 11, '2026-09-07', '2026-09-07 05:00:00.000', '2026-09-07 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (43, 12, '2026-09-07', '2026-09-07 05:00:00.000', '2026-09-07 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (44, 11, '2026-09-08', '2026-09-08 05:00:00.000', '2026-09-08 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (45, 12, '2026-09-08', '2026-09-08 05:00:00.000', '2026-09-08 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (46, 11, '2026-09-09', '2026-09-09 05:00:00.000', '2026-09-09 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (47, 12, '2026-09-09', '2026-09-09 05:00:00.000', '2026-09-09 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (48, 11, '2026-09-10', '2026-09-10 05:00:00.000', '2026-09-10 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573'),
    (49, 12, '2026-09-10', '2026-09-10 05:00:00.000', '2026-09-10 14:00:00.000', NULL, NULL, true, '2026-08-31 23:57:36.573', '2026-08-31 23:57:36.573');
  `);

  // 11. appointments
  await dataSource.query(`
    INSERT INTO appointments (id, client_id, master_id, service_id, start_time, end_time, status, comment, created_at, updated_at) VALUES
    (100, 24, 11, 26, '2026-09-01 10:00:00+07:00', '2026-09-01 11:00:00+07:00', 'created', 'Запись на массаж', NOW(), NOW()),
    (101, 25, 11, 26, '2026-09-01 11:00:00+07:00', '2026-09-01 12:00:00+07:00', 'confirmed', 'Подтвержденная запись', NOW(), NOW()),
    (102, 24, 12, 29, '2026-09-01 10:00:00+07:00', '2026-09-01 11:00:00+07:00', 'completed', 'Выполненная запись', NOW(), NOW()),
    (103, 25, 11, 26, '2026-09-02 10:00:00+07:00', '2026-09-02 11:00:00+07:00', 'await_confirm', 'Ожидает подтверждения', NOW(), NOW());
  `);

  // ===== Обновление последовательностей =====
  await dataSource.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`);
  await dataSource.query(`SELECT setval('clients_id_seq', (SELECT MAX(id) FROM clients));`);
  await dataSource.query(`SELECT setval('masters_id_seq', (SELECT MAX(id) FROM masters));`);
  await dataSource.query(`SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));`);
  await dataSource.query(`SELECT setval('service_prices_id_seq', (SELECT MAX(id) FROM service_prices));`);
  await dataSource.query(`SELECT setval('materials_id_seq', (SELECT MAX(id) FROM materials));`);
  await dataSource.query(`SELECT setval('material_prices_id_seq', (SELECT MAX(id) FROM material_prices));`);
  await dataSource.query(`SELECT setval('master_services_id_seq', (SELECT MAX(id) FROM master_services));`);
  await dataSource.query(`SELECT setval('service_materials_id_seq', (SELECT MAX(id) FROM service_materials));`);
  await dataSource.query(`SELECT setval('work_schedule_id_seq', (SELECT MAX(id) FROM work_schedule));`);
  await dataSource.query(`SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));`);
  await dataSource.query(`SELECT setval('appointment_services_id_seq', (SELECT MAX(id) FROM appointment_services));`);

  console.log('✅ Seed-данные успешно вставлены!');
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Ошибка заполнения seed-данных:', error);
  process.exit(1);
});