import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSimulationDTO } from './create-simulation.dto';
import { StatusSimulationDTO } from './status-simulation.dto';

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
    if (role === 'ADMIN') {
      const simulations = await this.prisma.simulation.findMany();
      return simulations;
    } else if (role === 'USER') {
      const simulations = await this.prisma.simulation.findMany({
        where: {
          teamId: teamId,
        },
      });
      return simulations;
    }
    return [];
  }

  async getSimulation(id: string, user: any) {
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

  async changeSimulationStatus(
    id: string,
    statusDto: StatusSimulationDTO,
    user: any,
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
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });
    }
  }
}
