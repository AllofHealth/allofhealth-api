import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CreateRecordQueue } from './records.queue';
import { CreateRecordProcessor } from '@/shared/processors/records.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-record-queue',
    }),
  ],
  providers: [CreateRecordQueue, CreateRecordProcessor],
  exports: [CreateRecordQueue],
})
export class RecordsQueueModule {}
