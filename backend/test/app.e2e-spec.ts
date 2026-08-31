import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Client } from '../src/entities/client.entity';
import { Master } from '../src/entities/master.entity';
import { Service } from '../src/entities/service.entity';
import { ServicePrice } from '../src/entities/service-price.entity';
import { Appointment } from '../src/entities/appointment.entity';
import { WorkSchedule } from '../src/entities/work-schedule.entity';
import { Material } from '../src/entities/material.entity';
import { MaterialPrice } from '../src/entities/material-price.entity';
import { ServiceMaterial } from '../src/entities/service-material.entity';
import { MasterService } from '../src/entities/master-service.entity';
import { AppointmentService } from '../src/entities/appointment-service.entity';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';

describe('App e2e', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: number;
  let masterId: number;
  let serviceId: number;
  let childServiceId: number;
  let materialId: number;
  let appointmentId: number;
  let appointmentServiceId: number;

  beforeAll(async () => {
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Очистка таблиц
    const dataSource = app.get(DataSource);
    console.log('🧹 Очистка таблиц...');
    await dataSource.query('TRUNCATE TABLE appointment_services CASCADE;');
    await dataSource.query('TRUNCATE TABLE appointments CASCADE;');
    await dataSource.query('TRUNCATE TABLE master_services CASCADE;');
    await dataSource.query('TRUNCATE TABLE service_materials CASCADE;');
    await dataSource.query('TRUNCATE TABLE work_schedule CASCADE;');
    await dataSource.query('TRUNCATE TABLE services CASCADE;');
    await dataSource.query('TRUNCATE TABLE materials CASCADE;');
    await dataSource.query('TRUNCATE TABLE masters CASCADE;');
    await dataSource.query('TRUNCATE TABLE clients CASCADE;');
    await dataSource.query('TRUNCATE TABLE users CASCADE;');
    console.log('✅ Очистка завершена');

    // 1. Создаём пользователя (админа)
    console.log('👤 Создание пользователя-админа...');
    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: 'Админ',
        phone: '+79990001122',
        password: 'admin123',
        role: 'admin',
      })
      .expect(201);
    userId = Number(userRes.body.id);
    console.log('✅ Пользователь создан, ID:', userId);

    // 2. Создаём клиента
    console.log('👤 Создание клиента...');
    const clientRepo = moduleFixture.get(getRepositoryToken(Client));
    const newClient = clientRepo.create({ user_id: userId });
    await clientRepo.save(newClient);
    console.log('✅ Клиент создан');

    // 3. Логин
    console.log('🔑 Логин...');
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: '+79990001122', password: 'admin123' })
      .expect(201);
    accessToken = loginRes.body.access_token;
    console.log('✅ Токен получен');

    // 4. Создаём мастера
    console.log('🧑‍🔧 Создание мастера...');
    const masterRes = await request(app.getHttpServer())
      .post('/masters')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userId: Number(userId),
        bio: 'Опытный мастер',
        rating: 4.8,
      })
      .expect(201);
    masterId = Number(masterRes.body.id);
    console.log('✅ Мастер создан, ID:', masterId);

    // 5. Создаём услугу (категорию)
    console.log('📋 Создание услуги-категории...');
    const serviceRes = await request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Массаж',
        shortName: 'Массаж',
        duration: 60,
        price: 2000,
      })
      .expect(201);
    serviceId = Number(serviceRes.body.id);
    console.log('✅ Услуга создана, ID:', serviceId);

    // 6. Создаём дочернюю услугу
    console.log('📋 Создание дочерней услуги...');
    const childRes = await request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Массаж спины',
        shortName: 'Спина',
        duration: 45,
        parentId: Number(serviceId),
        price: 1500,
      })
      .expect(201);
    childServiceId = Number(childRes.body.id);
    console.log('✅ Дочерняя услуга создана, ID:', childServiceId);

    // 7. Привязываем мастера к услуге (категории) через master_services
    console.log('🔗 Привязка мастера к услуге...');
    const masterServiceRepo = moduleFixture.get(getRepositoryToken(MasterService));
    const ms = masterServiceRepo.create({
      master_id: masterId,
      service_id: serviceId,
    });
    await masterServiceRepo.save(ms);
    console.log('✅ Мастер привязан к услуге');

    // 8. Создаём материал
    console.log('🧴 Создание материала...');
    const materialRes = await request(app.getHttpServer())
      .post('/materials')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Масло массажное',
        shortName: 'Масло',
        price: 300,
      })
      .expect(201);
    materialId = Number(materialRes.body.id);
    console.log('✅ Материал создан, ID:', materialId);

    // 9. Привязываем материал к услуге
    console.log('🔗 Привязка материала к услуге...');
    await request(app.getHttpServer())
      .post('/materials/service-material')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        serviceId: Number(serviceId),
        materialId: Number(materialId),
      })
      .expect(201);
    console.log('✅ Материал привязан');

    // 10. Создаём рабочий график
    console.log('📅 Создание рабочего графика...');
    await request(app.getHttpServer())
      .post('/work-schedule')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        masterId: Number(masterId),
        date: '2026-08-31',
        startTime: '2026-08-31T09:00:00+07:00',
        endTime: '2026-08-31T18:00:00+07:00',
        isWorking: true,
      })
      .expect(201);
    console.log('✅ График создан');

    console.log('🎯 Подготовка завершена успешно');
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ---------- Тесты ----------
  describe('Auth', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          fullName: 'Клиент',
          phone: '+79990001133',
          password: 'client123',
          role: 'client',
        })
        .expect(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.phone).toBe('+79990001133');
    });

    it('should return 409 when registering with existing phone', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          fullName: 'Дубликат',
          phone: '+79990001122',
          password: 'admin123',
        })
        .expect(409);
    });

    it('should return 401 on invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: '+79990001122', password: 'wrong' })
        .expect(401);
    });
  });

  describe('Users', () => {
    // Пропускаем тест, надо настроить позже
    it.skip('should find user by phone', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/by-phone?phone=+79990001122')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('phone', '+79990001122');
    });

    it('should return 404 when user by phone not found', async () => {
      await request(app.getHttpServer())
        .get('/users/by-phone?phone=+79990009999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Masters', () => {
    it('should get list of masters', async () => {
      const response = await request(app.getHttpServer())
        .get('/masters')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(Number(response.body[0].id)).toBe(masterId);
    });

    it('should filter masters by service', async () => {
      const response = await request(app.getHttpServer())
        .get(`/masters?serviceId=${serviceId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.length).toBe(1);
      expect(Number(response.body[0].id)).toBe(masterId);
    });
  });

  describe('Services', () => {
    it('should get active price for service', async () => {
      const response = await request(app.getHttpServer())
        .get(`/services/${serviceId}/price/active`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('price');
      expect(Number(response.body.price)).toBe(2000);
    });

    it('should deactivate old price when setting new one', async () => {
      await request(app.getHttpServer())
        .post(`/services/${serviceId}/price`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ price: 2500 })
        .expect(201);

      const newPrice = await request(app.getHttpServer())
        .get(`/services/${serviceId}/price/active`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Number(newPrice.body.price)).toBe(2500);
    });

    it('should get list of services with hierarchy', async () => {
      const response = await request(app.getHttpServer())
        .get('/services')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      const parent = response.body.find((s: any) => Number(s.id) === serviceId);
      if (parent && parent.children) {
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].name).toBe('Массаж спины');
      } else {
        const child = response.body.find((s: any) => Number(s.parent_id) === serviceId);
        expect(child).toBeDefined();
        expect(child.name).toBe('Массаж спины');
      }
    });
  });

  describe('Materials', () => {
    it('should create a material with price', async () => {
      const response = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Крем',
          shortName: 'Крем',
          price: 500,
        })
        .expect(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Крем');
    });

    it('should get active price for material', async () => {
      const response = await request(app.getHttpServer())
        .get(`/materials/${materialId}/price/active`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('price');
      expect(Number(response.body.price)).toBe(300);
    });

    it('should link material to service', async () => {
      const response = await request(app.getHttpServer())
        .get(`/materials?serviceId=${serviceId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.some((m: any) => Number(m.id) === materialId)).toBe(true);
    });

    it('should return materials filtered by service', async () => {
      const response = await request(app.getHttpServer())
        .get(`/materials?serviceId=${serviceId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(Number(response.body[0].id)).toBe(materialId);
    });
  });

  describe('Work Schedule', () => {
    it('should get work schedule for master by month', async () => {
      const response = await request(app.getHttpServer())
        .get(`/work-schedule?masterId=${masterId}&year=2026&month=8`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].date).toBe('2026-08-31');
    });

    it('should update work schedule for a day', async () => {
      const listResponse = await request(app.getHttpServer())
        .get(`/work-schedule?masterId=${masterId}&year=2026&month=8`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const record = listResponse.body.find((d: any) => d.date === '2026-08-31');
      expect(record).toBeDefined();
      const scheduleId = record.id;

      await request(app.getHttpServer())
        .put(`/work-schedule/${scheduleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          isWorking: false,
        })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/work-schedule?masterId=${masterId}&year=2026&month=8`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const day = response.body.find((d: any) => d.date === '2026-08-31');
      expect(day.is_working).toBe(false);
    });
  });

  describe('Appointments', () => {
    it('should create an appointment with existing client', async () => {
      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          clientId: Number(userId),
          masterId: Number(masterId),
          serviceId: Number(serviceId),
          startTime: '2026-08-31T10:00:00+07:00',
          comment: 'Тестовая запись',
        })
        .expect(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('created');
      appointmentId = Number(response.body.id);
    });

    it('should create an appointment with new client (by phone)', async () => {
      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          clientPhone: '+79990004455',
          clientFullName: 'Новый клиент',
          masterId: Number(masterId),
          serviceId: Number(serviceId),
          startTime: '2026-08-31T11:00:00+07:00',
        })
        .expect(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.client.user.full_name).toBe('Новый клиент');
    });

    it('should add service to appointment', async () => {
      const response = await request(app.getHttpServer())
        .post('/appointments/add-service')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          appointmentId: Number(appointmentId),
          serviceId: Number(serviceId),
          servicePrice: 2000,
          materialId: Number(materialId),
          materialPrice: 300,
          discount: 0,
        })
        .expect(201);
      expect(response.body).toHaveProperty('id');
      expect(Number(response.body.service_id)).toBe(serviceId);
      appointmentServiceId = Number(response.body.id);
    });

    it('should not allow duplicate service in same appointment', async () => {
      await request(app.getHttpServer())
        .post('/appointments/add-service')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          appointmentId: Number(appointmentId),
          serviceId: Number(serviceId),
          servicePrice: 2000,
        })
        .expect(409);
    });

    it('should get appointment with services', async () => {
      const response = await request(app.getHttpServer())
        .get(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('appointmentServices');
      expect(response.body.appointmentServices.length).toBe(1);
      expect(Number(response.body.appointmentServices[0].service_id)).toBe(serviceId);
    });

    // Пропускаем тесты, надо настроить позже
    it.skip('should get available slots', async () => {
      const response = await request(app.getHttpServer())
        .get(`/appointments/slots?masterId=${masterId}&date=2026-08-31&serviceId=${childServiceId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should confirm appointment', async () => {
      const response = await request(app.getHttpServer())
        .put(`/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'confirmed' })
        .expect(200);
      expect(response.body.status).toBe('confirmed');
    });

    it('should not allow overlapping appointments for same master', async () => {
      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          clientId: Number(userId),
          masterId: Number(masterId),
          serviceId: Number(serviceId),
          startTime: '2026-08-31T10:00:00+07:00',
          comment: 'Конфликт',
        })
        .expect(409);
      expect(response.body.message).toContain('уже занято');
    });

    it.skip('should update appointment to new time', async () => {
      const slotsRes = await request(app.getHttpServer())
        .get(`/appointments/slots?masterId=${masterId}&date=2026-08-31&serviceId=${childServiceId}`)
        .expect(200);
      const freeSlot = slotsRes.body.find((s: any) => s.start !== '2026-08-31T10:00:00+07:00');
      expect(freeSlot).toBeDefined();

      const response = await request(app.getHttpServer())
        .put(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          startTime: freeSlot.start,
        })
        .expect(200);
      expect(response.body.start_time).toBe(freeSlot.start);
    });

    it('should cancel appointment', async () => {
      const response = await request(app.getHttpServer())
        .put(`/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'cancelled' })
        .expect(200);
      expect(response.body.status).toBe('cancelled');
    });

    it('should delete appointment service', async () => {
      await request(app.getHttpServer())
        .delete(`/appointment-services/${appointmentServiceId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('Filtering and pagination', () => {
    it('should filter appointments by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/appointments?status=cancelled`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.every((a: any) => a.status === 'cancelled')).toBe(true);
    });

    it('should filter appointments by date range', async () => {
      const response = await request(app.getHttpServer())
        .get(`/appointments?dateFrom=2026-08-31&dateTo=2026-08-31`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Validation', () => {
    it('should return 400 when creating service without required fields', async () => {
      await request(app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Неполная услуга' })
        .expect(400);
    });

    it('should return 404 for non-existent master in appointment', async () => {
      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          clientId: Number(userId),
          masterId: 99999,
          serviceId: Number(serviceId),
          startTime: '2026-08-31T12:00:00+07:00',
        })
        .expect(404);
    });
  });
});