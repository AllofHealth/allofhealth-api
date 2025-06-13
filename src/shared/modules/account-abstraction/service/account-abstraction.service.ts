import { CreateSmartAccount } from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AccountAbstractionSuccessMessage } from '../data/account-abstraction.data';
import { AccountAbstractionProvider } from '../provider/account-abstraction.provider';

@Injectable()
export class AccountAbstractionService {
  private errorHandler: ErrorHandler;
  constructor(private readonly provider: AccountAbstractionProvider) {
    this.errorHandler = new ErrorHandler();
  }

  @OnEvent(SharedEvents.CREATE_SMART_ACCOUNT, { async: true })
  async createSmartAccount(ctx: CreateSmartAccount) {
    const result = await this.provider.createSmartAccount(ctx.userId);

    return this.errorHandler.handleResult(
      result,
      AccountAbstractionSuccessMessage.SMART_ACCOUNT_CREATED,
    );
  }
}
