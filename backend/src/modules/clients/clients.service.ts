import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Client } from '../../entities/client.entity';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Поиск клиента по телефону
  async findByPhone(phone: string): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { user: { phone } },
      relations: { user: true }, // правильный синтаксис для отношений
    });
    if (!client) {
      throw new NotFoundException(`Клиент с телефоном ${phone} не найден`);
    }
    return client;
  }

  // Создание клиента
  async createClient(phone: string, fullName: string): Promise<Client> {
    // Проверяем, не существует ли уже пользователь с таким телефоном
    const existingUser = await this.userRepo.findOne({ where: { phone } });
    if (existingUser) {
      // Если пользователь есть, проверяем, есть ли клиент
      const existingClient = await this.clientRepo.findOne({
        where: { user: existingUser },
        relations: { user: true },
      });
      if (existingClient) {
        throw new ConflictException(`Клиент с телефоном ${phone} уже существует`);
      }
      // Если пользователь есть, но клиента нет – создаём клиента
      const client = new Client();
      client.user = existingUser;
      return this.clientRepo.save(client);
    }

    // Генерируем случайный пароль (клиент сможет его сменить позже)
    const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Создаём пользователя
    const user = new User();
    user.phone = phone;
    user.full_name = fullName;
    user.role = UserRole.CLIENT;
    user.password_hash = hashedPassword;
    user.is_active = true;
    const savedUser = await this.userRepo.save(user);

    // Создаём клиента, привязывая к пользователю
    const client = new Client();
    client.user = savedUser;
    return this.clientRepo.save(client);
  }
}