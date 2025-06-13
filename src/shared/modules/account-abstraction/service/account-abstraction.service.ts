import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Injectable } from '@nestjs/common';
import {
  AccountAbstractionErrorMessage,
  AccountAbstractionSuccessMessage,
} from '../data/account-abstraction.data';
import { AccountAbstractionProvider } from '../provider/account-abstraction.provider';
import { OnEvent } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/shared.events';

@Injectable()
export class AccountAbstractionService {
  private errorHandler: ErrorHandler;
  constructor(private readonly provider: AccountAbstractionProvider) {
    this.errorHandler = new ErrorHandler();
  }

  @OnEvent(SharedEvents.CREATE_SMART_ACCOUNT, { async: true })
  async createSmartAccount() {
    const result = await this.provider.createSmartAccount();
    if (result.isErr()) {
      return this.errorHandler.handleError(
        result.error,
        AccountAbstractionErrorMessage.ERROR_CREATING_SMART_ACCOUNT,
      );
    }

    return this.errorHandler.handleResult(
      result,
      AccountAbstractionSuccessMessage.SMART_ACCOUNT_CREATED,
    );
  }
}
