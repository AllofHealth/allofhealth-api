import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CreateSmartAccountProcessor } from '@/shared/processors/account.processor';
import { CreateSmartAccountQueue } from './account.queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-smart-account-queue',
    }),
  ],
  providers: [CreateSmartAccountQueue, CreateSmartAccountProcessor],
  exports: [CreateSmartAccountQueue],
})
export class AccountQueueModule {}
