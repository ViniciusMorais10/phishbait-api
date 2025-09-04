import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateCompanyDTO } from './create-company.dto';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { CurrentUser } from 'auth/decorators/current-user.decorator';
import { RolesGuard } from 'auth/guards/role.guards';
import Roles from 'auth/decorators/roles.decorator';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() data: CreateCompanyDTO, @CurrentUser() user: any) {
    console.log(user);
    return await this.companyService.create(data, user.userId);
  }
}
