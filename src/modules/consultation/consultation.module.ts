import { Module } from '@nestjs/common';
import { ConsultationProvider } from './provider/consultation.provider';
import { ConsultationService } from './service/consultation.service';
import { ConsultationController } from './controller/consultation.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [ConsultationService, ConsultationProvider, ErrorHandler],
  controllers: [ConsultationController],
  exports: [ConsultationService],
})
export class ConsultationModule {}
