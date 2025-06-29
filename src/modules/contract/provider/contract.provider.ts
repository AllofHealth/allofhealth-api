import { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import { ExternalAccountService } from '@/shared/modules/external-account/service/external-account.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ABI,
  ContractErrorMessages,
  ContractSuccessMessages,
} from '../data/contract.data';
import { ethers } from 'ethers';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Injectable()
export class ContractProvider {
  constructor(
    private readonly contractConfig: ContractConfig,
    private readonly eoaService: ExternalAccountService,
    private readonly handlerService: ErrorHandler,
  ) {}

  private provideABI() {
    return ABI;
  }

  private async provideSigner(userId: string) {
    return this.eoaService.provideSigner(userId);
  }

  provideAdminContractInstance() {
    return new ethers.Contract(
      this.contractConfig.CONTRACT_ADDRESS,
      this.provideABI(),
      this.eoaService.provideAdminSigner(),
    );
  }

  async provideContract(userId: string) {
    const signer = await this.provideSigner(userId);
    return new ethers.Contract(
      this.contractConfig.CONTRACT_ADDRESS,
      this.provideABI(),
      signer,
    );
  }

  async handleGetSystemAdminCount() {
    try {
      const contract = this.provideAdminContractInstance();
      const count = await contract.systemAdminCount();
      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: ContractSuccessMessages.TX_EXECUTED_SUCCESSFULLY,
        data: Number(count),
      });
    } catch (e) {
      return this.handlerService.handleError(
        e,
        ContractErrorMessages.ERROR_PROVIDING_SYSTEM_ADMIN_COUNT,
      );
    }
  }
}
