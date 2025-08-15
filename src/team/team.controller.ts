import { Body, Controller, Post } from '@nestjs/common';
import { CreateTeamDTO } from './create-team.dto';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
  @Post()
  async createTeam(@Body() data: CreateTeamDTO) {
    return await this.teamService.create(data);
  }
}
