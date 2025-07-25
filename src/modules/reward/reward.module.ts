import { Module } from '@nestjs/common';
import { RewardProvider } from './provider/reward.provider';
import { RewardService } from './service/reward.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { MintQueueModule } from '@/shared/queues/mint/mint-queue.module';
import { RewardDistributionService } from './tasks/reward-distrubtion.task';

@Module({
  imports: [MintQueueModule],
  providers: [
    RewardProvider,
    RewardService,
    ErrorHandler,
    RewardDistributionService,
  ],
  exports: [RewardService],
})
export class RewardModule {}
