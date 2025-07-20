import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MintTokenQueue } from './mint.queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mint-health-token-queue',
    }),
  ],
  providers: [MintTokenQueue],
  exports: [MintTokenQueue],
})
export class MintQueueModule {}
