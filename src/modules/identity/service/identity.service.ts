import { StoreId } from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IDENTITY_SUCCESS_MESSAGES } from '../data/identity.data';
import { IdentityProvider } from '../provider/identity.provider';

@Injectable()
export class IdentityService {
  private handler: ErrorHandler;
  constructor(private readonly identityProvider: IdentityProvider) {
    this.handler = new ErrorHandler();
  }

  @OnEvent(SharedEvents.STORE_IDENTIFICATION)
  storeIdentity(ctx: StoreId) {
    const result = this.identityProvider.storeId(ctx);
    return this.handler.handleResult(
      result,
      IDENTITY_SUCCESS_MESSAGES.SUCCESS_STORING_IDENTIFICATION,
    );
  }
}
