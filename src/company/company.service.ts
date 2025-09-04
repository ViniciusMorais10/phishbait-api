import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCompanyDTO } from './create-company.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateCompanyDTO, user: string) {
    try {
      if (!data.name) {
        throw new HttpException(
          'Nome da empresa é obrigatório',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existCompany = await this.prisma.company.findFirst({
        where: {
          cnpj: data.cnpj,
        },
      });

      if (existCompany) {
        throw new HttpException(
          'Empresa já cadastrada',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.prisma.company.create({
        data: {
          name: data.name,
          cnpj: data.cnpj,
          createdBy: user,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error?.code === 'P2002') {
        throw new HttpException('CNPJ já cadastrado', HttpStatus.BAD_REQUEST);
      }

      throw new InternalServerErrorException('Erro ao criar empresa');
    }
  }
}
