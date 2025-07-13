import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Module } from '@nestjs/common';
import { DoctorModule } from '../doctor/doctor.module';
import { RecordsController } from './controller/records.controller';
import { RecordsProvider } from './provider/records.provider';
import { RecordsService } from './service/records.service';

@Module({
  imports: [DoctorModule],
  providers: [RecordsProvider, RecordsService, ErrorHandler],
  controllers: [RecordsController],
})
export class RecordsModule {}
