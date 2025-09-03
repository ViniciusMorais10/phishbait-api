import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { UserService } from 'user/user.service';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwt: JwtService,
  ) {}

  async login(data: LoginDTO) {
    const user = await this.userService.findUserByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      teamId: user.teamId,
    };

    const token = await this.jwt.signAsync(payload);

    const { password, ...safeUser } = user as any;

    return {
      acess_token: token,
      user: safeUser,
    };
  }
}
