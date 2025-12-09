import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { StoreId, UpdateDoctorId } from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import { IdentityProvider } from '../provider/identity.provider';
import { IUpdateDoctorIdentity } from '../interface/identity.interface';

@Injectable()
export class IdentityService {
  constructor(private readonly identityProvider: IdentityProvider) {}

  @OnEvent(SharedEvents.STORE_IDENTIFICATION)
  async storeIdentity(ctx: StoreId) {
    return await this.identityProvider.storeId(ctx);
  }

  @OnEvent(SharedEvents.UPDATE_IDENTITY)
  async updateIdentity(ctx: UpdateDoctorId) {
    return await this.identityProvider.updateDoctorIdentity(ctx);
  }
}
