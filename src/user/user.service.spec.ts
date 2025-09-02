import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            team: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve criar um usuário com dados válidos', async () => {
    const dto = {
      name: 'Vinicius',
      email: 'vinicius@email.com',
      password: '123456',
      teamId: 'team-uuid',
      role: Role.ADMIN,
    };

    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    prisma.team.findUnique = jest.fn().mockResolvedValue({ id: 'team-uuid' });

    prisma.user.create = jest.fn().mockResolvedValue({
      id: 'user-uuid',
      name: dto.name,
      email: dto.email,
      teamId: dto.teamId,
      role: dto.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createUser(dto);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: dto.email,
      },
    });

    expect(prisma.team.findUnique).toHaveBeenCalledWith({
      where: {
        id: dto.teamId,
      },
    });

    expect(result).toEqual({
      id: 'user-uuid',
      name: dto.name,
      email: dto.email,
      teamId: dto.teamId,
      role: dto.role,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: dto.email,
        name: dto.name,
        password: 'hashed-password',
        teamId: dto.teamId,
        role: dto.role,
      },
    });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');

    expect(Object.keys(result)).not.toContain('password');
  });

  it('não deve permitir emails duplicados', async () => {
    const dto = {
      name: 'Vinicius',
      email: 'vinicius@email.com',
      password: '123456',
      teamId: 'team-uuid',
      role: Role.ADMIN,
    };

    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 'user-uuid' });

    await expect(service.createUser(dto)).rejects.toThrow(
      'Email already exists',
    );
  });

  it('não deve permitir criação de usuário com time inexistente', async () => {
    const dto = {
      name: 'Vinicius',
      email: 'vinicius@email.com',
      password: '123456',
      teamId: 'team-uuid',
      role: Role.ADMIN,
    };

    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    prisma.team.findUnique = jest.fn().mockResolvedValue(null);

    await expect(service.createUser(dto)).rejects.toThrow('Time not found');
  });
});
