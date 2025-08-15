import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDTO } from './create-team.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTeamDTO) {
    try {
      if (!data.name) {
        throw new HttpException(
          'Nome do time é obrigatório',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!data.companyId) {
        throw new HttpException(
          'ID da empresa é obrigatório',
          HttpStatus.BAD_REQUEST,
        );
      }

      const isValidUUID = isUUID(data.companyId);

      if (!isValidUUID) {
        throw new HttpException(
          'ID da empresa inválido',
          HttpStatus.BAD_REQUEST,
        );
      }

      const companyExists = await this.prisma.company.findFirst({
        where: {
          id: data.companyId,
        },
      });

      if (!companyExists) {
        throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
      }

      return await this.prisma.team.create({
        data: {
          name: data.name,
          companyId: data.companyId,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error?.code === 'P2002') {
        throw new HttpException(
          'Time já existente para esta empresa',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new InternalServerErrorException('Erro ao criar time');
    }
  }
}
