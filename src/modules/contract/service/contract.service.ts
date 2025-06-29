import { Injectable } from '@nestjs/common';
import { ContractProvider } from '../provider/contract.provider';

@Injectable()
export class ContractService {
  constructor(private readonly contractProvider: ContractProvider) {}

  async systemAdminCount() {
    return await this.contractProvider.handleGetSystemAdminCount();
  }

  async registerPatient(userId: string) {
    return await this.contractProvider.handleRegisterPatient(userId);
  }
}
