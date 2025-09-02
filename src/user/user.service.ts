import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDTO } from './create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

import { Role, User } from '@prisma/client';

type SafeUser = Omit<User, 'password'>;

import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async createUser(user: CreateUserDTO) {
    try {
      const emailExists = await this.prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });

      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }

      const teamExists = await this.prisma.team.findUnique({
        where: {
          id: user.teamId,
        },
      });

      if (!teamExists) {
        throw new NotFoundException('Time not found');
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          teamId: user.teamId,
          role: user.role ?? Role.USER,
        },
      });

      const { password, ...safeUser } = newUser as any;
      return safeUser as SafeUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error?.code === 'P2002') {
        throw new HttpException('Email ja esta em uso', HttpStatus.BAD_REQUEST);
      }

      throw new InternalServerErrorException('Erro ao criar usuario');
    }
  }
}
