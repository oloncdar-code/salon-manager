import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(pass, user.password_hash);
    if (!isPasswordValid) return null;

    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}