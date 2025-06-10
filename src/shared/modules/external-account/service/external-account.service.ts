import { Injectable } from '@nestjs/common';
import { ExternalAccountProvider } from '../provider/external-account.provider';
import {
  ExternalAccountErrorMessage,
  ExternalAccountSuccessMessage,
} from '../data/external-account.data';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Injectable()
export class ExternalAccountService {
  private errorHandler: ErrorHandler;

  constructor(
    private readonly externalAccountProvider: ExternalAccountProvider,
  ) {
    this.errorHandler = new ErrorHandler();
  }

  createExternalWallet() {
    const result = this.externalAccountProvider.handleCreateWallet();
    if (result.isErr()) {
      return this.errorHandler.handleError(
        result.error,
        ExternalAccountErrorMessage.FAILED_TO_CREATE_WALLET,
      );
    }

    if (result.isOk()) {
      return this.errorHandler.handleResult(
        result,
        ExternalAccountSuccessMessage.WALLET_CREATED,
      );
    }
  }
}
