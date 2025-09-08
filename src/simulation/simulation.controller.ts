import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { CreateSimulationDTO } from './create-simulation.dto';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { RolesGuard } from 'auth/guards/role.guards';
import Roles from 'auth/decorators/roles.decorator';
import { CurrentUser } from 'auth/decorators/current-user.decorator';
import { StatusSimulationDTO } from './status-simulation.dto';
import { CurrentUserPayload } from 'auth/types/current-user';

@Controller('simulations')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post()
  async createSimulation(
    @Body() data: CreateSimulationDTO,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const { userId, teamId } = user;

    return this.simulationService.createSimulation(data, userId, teamId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getSimulations(@CurrentUser() user: CurrentUserPayload) {
    const { role, teamId } = user;
    return this.simulationService.getSimulations(role, teamId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getSimultion(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.simulationService.getSimulation(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id/status')
  async changeSimulationStatus(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() status: StatusSimulationDTO,
  ) {
    return this.simulationService.updateSimulationStatus(id, status, user);
  }
}
