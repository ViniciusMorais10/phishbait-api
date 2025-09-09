import { Test, TestingModule } from '@nestjs/testing';
import { SimulationService } from './simulation.service';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from './status-simulation.dto';

describe('SimulationService', () => {
  let service: SimulationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationService,
        {
          provide: PrismaService,
          useValue: {
            simulation: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SimulationService>(SimulationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve criar uma simulação com dados válidos', async () => {
    const dto = {
      name: 'Simulação 1',
      description: 'Simulação de teste',
      createdBy: 'user-uuid',
      teamId: 'team-uuid',
    };

    const user = {
      userId: 'user-uuid',
      teamId: 'team-uuid',
      role: 'USER',
    };

    prisma.simulation.create = jest.fn().mockResolvedValue({
      id: 'simulation-uuid',
      name: dto.name,
      description: dto.description,
      teamId: user.teamId,
      status: 'PENDING',
      createdBy: user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createSimulation(
      dto,
      user.userId,
      user.teamId,
    );

    expect(prisma.simulation.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        description: dto.description,
        teamId: user.teamId,
        createdBy: user.userId,
      },
    });

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(dto.name);
  });

  it('deve ser possivel listar as simulacoes se for USER', async () => {
    const dto = {
      name: 'Simulação 1',
      description: 'Simulação de teste',
      createdBy: 'user-uuid',
      teamId: 'team-uuid',
    };

    const user = {
      userId: 'user-uuid',
      teamId: 'team-uuid',
      role: 'USER',
    };

    prisma.simulation.findMany = jest.fn().mockResolvedValue([
      {
        id: 'simulation-uuid',
        name: dto.name,
        description: dto.description,
        teamId: user.teamId,
        status: 'PENDING',
        createdBy: user.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.getSimulations(user.role, user.teamId);

    expect(prisma.simulation.findMany).toHaveBeenCalledWith({
      where: {
        teamId: user.teamId,
      },
    });

    expect(result).toHaveLength(1);
  });

  it('deve ser possivel listar as simulacoes se for ADMIN', async () => {
    const dto = {
      name: 'Simulação 1',
      description: 'Simulação de teste',
      createdBy: 'user-uuid',
      teamId: 'team-uuid',
    };

    const user = {
      userId: 'user-uuid',
      teamId: 'team-uuid',
      role: 'ADMIN',
    };

    prisma.simulation.findMany = jest.fn().mockResolvedValue([
      {
        id: 'simulation-uuid',
        name: dto.name,
        description: dto.description,
        teamId: user.teamId,
        status: 'PENDING',
        createdBy: user.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.getSimulations(user.role, user.teamId);

    expect(prisma.simulation.findMany).toHaveBeenCalledWith({
      where: {},
    });

    expect(result).toHaveLength(1);
  });

  it('deve permitir alteração se user for ADMIN ou mesmo time', async () => {
    const simulation = { id: 'sim-1', teamId: 'team-uuid' };

    const user = {
      userId: 'user-uuid',
      teamId: 'team-uuid',
      role: 'USER',
    };

    prisma.simulation.findUnique = jest.fn().mockResolvedValue(simulation);

    prisma.simulation.update = jest.fn().mockResolvedValue({
      ...simulation,
      status: 'COMPLETED',
    });
    const result = await service.updateSimulationStatus(
      'sim-1',
      { status: Status.COMPLETED },
      user,
    );

    expect(prisma.simulation.findUnique).toHaveBeenCalledWith({
      where: { id: 'sim-1' },
    });
    expect(prisma.simulation.update).toHaveBeenCalledWith({
      where: { id: 'sim-1' },
      data: { status: 'COMPLETED' },
    });

    expect(result.status).toBe('COMPLETED');
  });
});
