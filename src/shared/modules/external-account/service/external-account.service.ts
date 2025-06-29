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

  createNewSigner() {
    return this.externalAccountProvider.createSigner();
  }
  async provideSigner(userId: string) {
    return this.externalAccountProvider.provideSigner(userId);
  }
}
