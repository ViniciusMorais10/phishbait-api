import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TeamService', () => {
  let service: TeamService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: PrismaService,
          useValue: {
            team: {
              create: jest.fn(),
            },
            company: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve criar um time com dados válidos', async () => {
    const dto = {
      name: 'Time Teste',
      companyId: 'b44126f0-c175-4ec1-ace0-25b5fb3c2fe7',
    };

    prisma.company.findFirst = jest
      .fn()
      .mockResolvedValue({ id: dto.companyId });

    prisma.team.create = jest.fn().mockResolvedValue({ id: '1233', ...dto });

    const result = await service.create(dto);

    expect(result).toEqual({ id: '1233', ...dto });

    expect(prisma.company.findFirst).toHaveBeenCalledWith({
      where: {
        id: dto.companyId,
      },
    });

    expect(prisma.team.create).toHaveBeenCalledWith({
      data: dto,
    });
  });
});
