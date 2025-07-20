import { Module } from '@nestjs/common';
import { RewardProvider } from './provider/reward.provider';
import { RewardService } from './service/reward.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [RewardProvider, RewardService, ErrorHandler],
  exports: [RewardService],
})
export class RewardModule {}
