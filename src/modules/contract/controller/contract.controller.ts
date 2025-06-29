import { Controller, Get } from '@nestjs/common';
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
}
