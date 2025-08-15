import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: {
            company: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve criar empresa com dados válidos', async () => {
    const dto = { name: 'Empresa Teste', cnpj: '12345678900001' };

    prisma.company.findFirst = jest.fn().mockResolvedValue(null);

    prisma.company.create = jest.fn().mockResolvedValue({ id: '123', ...dto });

    const result = await service.create(dto);

    expect(result).toEqual({ id: '123', ...dto });

    expect(prisma.company.findFirst).toHaveBeenCalledWith({
      where: { cnpj: dto.cnpj },
    });
    expect(prisma.company.create).toHaveBeenCalledWith({
      data: dto,
    });
  });
});
