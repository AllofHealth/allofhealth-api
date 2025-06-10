import { Injectable } from '@nestjs/common';
import { ExternalAccountProvider } from '../provider/external-account.provider';
import {
  ExternalAccountErrorMessage,
  ExternalAccountSuccessMessage,
} from '../data/external-account.data';

@Injectable()
export class ExternalAccountService {
  constructor(
    private readonly externalAccountProvider: ExternalAccountProvider,
  ) {}

  createExternalWallet() {
    const result = this.externalAccountProvider.handleCreateWallet();
    if (result.isErr()) {
      return this.externalAccountProvider.handleError(
        result.error,
        ExternalAccountErrorMessage.FAILED_TO_CREATE_WALLET,
      );
    }

    if (result.isOk()) {
      return this.externalAccountProvider.handleResult(
        result,
        ExternalAccountSuccessMessage.WALLET_CREATED,
      );
    }
  }
}
