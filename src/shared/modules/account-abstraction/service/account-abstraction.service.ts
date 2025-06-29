import { CreateSmartAccount } from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AccountAbstractionProvider } from '../provider/account-abstraction.provider';

@Injectable()
export class AccountAbstractionService {
  constructor(private readonly provider: AccountAbstractionProvider) {}

  @OnEvent(SharedEvents.CREATE_SMART_ACCOUNT, { async: true })
  async createSmartAccount(ctx: CreateSmartAccount) {
    return this.provider.createSmartAccount(ctx.userId);
  }

  async getSmartAddress(userId: string) {
    return await this.provider.getSmartAddress(userId);
  }

  async provideSmartWallet(userId: string) {
    return await this.provider.provideSmartWallet(userId);
  }
}
