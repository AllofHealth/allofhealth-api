import { Injectable } from '@nestjs/common';
import { IdentityProvider } from '../provider/identity.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { IStoreIdentification } from '../interface/identity.interface';
import { IDENTITY_SUCCESS_MESSAGES } from '../data/identity.data';

@Injectable()
export class IdentityService {
  private handler: ErrorHandler;
  constructor(private readonly identityProvider: IdentityProvider) {
    this.handler = new ErrorHandler();
  }

  storeIdentity(ctx: IStoreIdentification) {
    const result = this.identityProvider.storeId(ctx);
    return this.handler.handleResult(
      result,
      IDENTITY_SUCCESS_MESSAGES.SUCCESS_STORING_IDENTIFICATION,
    );
  }
}
