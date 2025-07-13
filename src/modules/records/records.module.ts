import { Module } from '@nestjs/common';
import { RecordsProvider } from './provider/records.provider';
import { RecordsService } from './service/records.service';
import { RecordsController } from './controller/records.controller';

@Module({
  providers: [RecordsProvider, RecordsService],
  controllers: [RecordsController],
})
export class RecordsModule {}
