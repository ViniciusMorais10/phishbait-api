import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { PrismaService } from 'prisma/prisma.service';

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
});
