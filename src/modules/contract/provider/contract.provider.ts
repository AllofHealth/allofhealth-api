import { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import { ExternalAccountService } from '@/shared/modules/external-account/service/external-account.service';
import { Injectable } from '@nestjs/common';
import { ABI } from '../data/contract.data';
import { ethers } from 'ethers';

@Injectable()
export class ContractProvider {
  constructor(
    private readonly contractConfig: ContractConfig,
    private readonly eoaService: ExternalAccountService,
  ) {}

  private provideABI() {
    return ABI;
  }

  private async provideSigner(userId: string) {
    return this.eoaService.provideSigner(userId);
  }

  async provideContract(userId: string) {
    const signer = await this.provideSigner(userId);
    return new ethers.Contract(
      this.contractConfig.CONTRACT_ADDRESS,
      this.provideABI(),
      signer,
    );
  }
}
