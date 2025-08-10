import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'handle-upload-record-queue',
    }),
  ],
  providers: [],
  exports: [],
})
export class RecordsQueueModule {}
