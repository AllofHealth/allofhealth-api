import { forwardRef, Module } from '@nestjs/common';
import { RewardProvider } from './provider/reward.provider';
import { RewardService } from './service/reward.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { MintQueueModule } from '@/shared/queues/mint/mint-queue.module';
import { RewardDistributionService } from './tasks/reward-distrubtion.task';
import { ContractModule } from '../contract/contract.module';
import { RewardController } from './controller/reward.controller';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    MintQueueModule,
    forwardRef(() => ContractModule),
    forwardRef(() => UserModule),
    forwardRef(() => TokenModule),
  ],
  providers: [
    RewardProvider,
    RewardService,
    ErrorHandler,
    RewardDistributionService,
  ],
  exports: [RewardService],
  controllers: [RewardController],
})
export class RewardModule {}
