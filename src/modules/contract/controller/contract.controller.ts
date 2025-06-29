import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContractService } from '../service/contract.service';

@ApiTags('Contract Operations')
@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get('system-admin-count')
  async systemAdminCount() {
    return await this.contractService.systemAdminCount();
  }

  @Get('patientCount')
  async patientCount() {
    return await this.contractService.getPatientCount();
  }

  @Post('registerPatient')
  async registerPatient(@Query('userId') userId: string) {
    return await this.contractService.registerPatient({
      userId,
    });
  }
}
