import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContractService } from '../service/contract.service';
import {
  IsApprovedToAddRecordDto,
  ViewMedicalRecordDto,
} from '../dto/contract.dto';

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

  @Post('patientContractId')
  async patientContractId(@Body() ctx: { smartAddress: string }) {
    return await this.contractService.getPatientContractId(ctx.smartAddress);
  }

  @Post('isApprovedToAddNewRecord')
  async isApprovedToAddNewRecord(@Body() ctx: IsApprovedToAddRecordDto) {
    return await this.contractService.isApprovedToAddNewRecord({
      patientId: ctx.patientId,
      doctorAddress: ctx.doctorAddress,
    });
  }

  @Post('viewMedicalRecord')
  async viewMedicalRecord(@Body() ctx: ViewMedicalRecordDto) {
    return await this.contractService.viewMedicalRecord(ctx);
  }
}
