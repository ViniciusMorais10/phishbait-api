import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSimulationDTO } from './create-simulation.dto';
import { StatusSimulationDTO } from './status-simulation.dto';
import { CurrentUserPayload } from 'auth/types/current-user';

@Injectable()
export class SimulationService {
  constructor(private readonly prisma: PrismaService) {}

  async createSimulation(
    data: CreateSimulationDTO,
    userId: string,
    teamId: string,
  ) {
    const simulation = await this.prisma.simulation.create({
      data: {
        name: data.name,
        description: data.description,
        teamId: teamId,
        createdBy: userId,
      },
    });

    return simulation;
  }

  async getSimulations(role: string, teamId: string) {
    const where = role === 'ADMIN' ? {} : { teamId: teamId };
    return this.prisma.simulation.findMany({
      where: where,
    });
  }

  async getSimulation(id: string, user: CurrentUserPayload) {
    const simulation = await this.prisma.simulation.findUnique({
      where: {
        id: id,
      },
    });

    if (!simulation) {
      throw new ForbiddenException('Simulation not found');
    }

    if (simulation.teamId === user.teamId || user.role === 'ADMIN') {
      return simulation;
    }

    throw new ForbiddenException(
      'You are not authorized to access this simulation',
    );
  }

  async updateSimulationStatus(
    id: string,
    statusDto: StatusSimulationDTO,
    user: CurrentUserPayload,
  ) {
    const { status } = statusDto;
    const simulation = await this.prisma.simulation.findUnique({
      where: {
        id: id,
      },
    });

    if (!simulation) {
      throw new ForbiddenException('Simulation not found');
    }

    if (simulation.teamId === user.teamId || user.role === 'ADMIN') {
      return this.prisma.simulation.update({
        where: { id },
        data: { status: status },
      });
    }

    throw new ForbiddenException(
      'Acesso negado para alterar o status da simulação',
    );
  }
}
