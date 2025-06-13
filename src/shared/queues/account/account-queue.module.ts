import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CreateSmartAccountQueue } from './account.queue';
import { CreateSmartAccountProcessor } from '@/shared/processors/account.processor';

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
