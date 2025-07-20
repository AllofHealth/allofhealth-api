import { Injectable } from '@nestjs/common';
import { RewardProvider } from '../provider/reward.provider';
import { EUpdateTaskCount } from '@/shared/dtos/event.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/shared.events';

@Injectable()
export class RewardService {
  constructor(private readonly rewardProvider: RewardProvider) {}

  async updateMintedState(userId: string, state: boolean) {
    return await this.rewardProvider.updateMintedState(userId, state);
  }

  @OnEvent(SharedEvents.TASK_COMPLETED)
  async incrementDailyCount(ctx: EUpdateTaskCount) {
    return await this.rewardProvider.incrementDailyCount(ctx.userId);
  }
}
