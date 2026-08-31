import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
  const { fullName, phone, email, password, role } = createUserDto;

  const existing = await this.usersRepository.findOne({
    where: [{ phone }, ...(email ? [{ email }] : [])],
  });
  if (existing) {
    throw new ConflictException('Пользователь с таким телефоном или email уже существует');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = this.usersRepository.create({
    full_name: fullName,   // ← ключевое исправление
    phone,
    email,
    password_hash: hashedPassword,
    role: role || UserRole.CLIENT,
  });
  return this.usersRepository.save(user);
}

  async findAll(role?: string): Promise<User[]> {
    const where: any = {};
    if (role) {
      where.role = role;
    }
    return this.usersRepository.find({ where });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    // Объединяем объекты
    const updated = { ...user, ...updateUserDto };
    return this.usersRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}