import { Body, Controller, Post } from '@nestjs/common';
import { CreateCompanyDTO } from './create-company.dto';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async create(@Body() data: CreateCompanyDTO) {
    return await this.companyService.create(data);
  }
}
