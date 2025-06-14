import { StoreId } from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IdentityProvider } from '../provider/identity.provider';

@Injectable()
export class IdentityService {
  constructor(private readonly identityProvider: IdentityProvider) {}

  @OnEvent(SharedEvents.STORE_IDENTIFICATION)
  async storeIdentity(ctx: StoreId) {
    return this.identityProvider.storeId(ctx);
  }
}
