import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { CreateRecordQueue } from './records.queue';
import { CreateRecordProcessor } from '@/shared/processors/records.processor';
import { ContractModule } from '@/modules/contract/contract.module';
import { RecordsModule } from '@/modules/records/records.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-record-queue',
    }),
    forwardRef(() => RecordsModule),
    ContractModule,
  ],
  providers: [CreateRecordQueue, CreateRecordProcessor],
  exports: [CreateRecordQueue],
})
export class RecordsQueueModule {}
