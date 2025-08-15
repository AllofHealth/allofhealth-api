import { Injectable } from '@nestjs/common';
import { RewardProvider } from '../provider/reward.provider';
import { EUpdateTaskCount } from '@/shared/dtos/event.dto';

@Injectable()
export class RewardService {
  constructor(private readonly rewardProvider: RewardProvider) {}

  async updateMintedState(userId: string, state: boolean) {
    return await this.rewardProvider.updateMintedState(userId, state);
  }

  async incrementDailyCount(ctx: EUpdateTaskCount) {
    return await this.rewardProvider.incrementDailyCount(ctx.userId);
  }

  async fetchRewardMetrics(userId: string) {
    return await this.rewardProvider.fetchRewardMetrics(userId);
  }
}
