import { Module } from '@nestjs/common';
import { RewardProvider } from './provider/reward.provider';
import { RewardService } from './service/reward.service';

@Module({
  providers: [RewardProvider, RewardService],
})
export class RewardModule {}
