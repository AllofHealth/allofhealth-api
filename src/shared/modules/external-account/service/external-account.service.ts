import { Injectable } from '@nestjs/common';
import { ExternalAccountProvider } from '../provider/external-account.provider';

@Injectable()
export class ExternalAccountService {
  constructor(
    private readonly externalAccountProvider: ExternalAccountProvider,
  ) {}

  createExternalWallet() {
    return this.externalAccountProvider.handleCreateWallet();
  }

  createNewSigner(rpc?: string) {
    return this.externalAccountProvider.createSigner();
  }
  async provideSigner(userId: string) {
    return this.externalAccountProvider.provideSigner(userId);
  }

  provideAdminSigner(rpc?: string) {
    return this.externalAccountProvider.provideAdminSigner(rpc);
  }

  async getBalance(walletAddress: string) {
    return await this.externalAccountProvider.getBalance(walletAddress);
  }
}
