import { Module } from '@nestjs/common';
import { ConsultationProvider } from './provider/consultation.provider';
import { ConsultationService } from './service/consultation.service';
import { ConsultationController } from './controller/consultation.controller';

@Module({
  providers: [ConsultationService, ConsultationProvider],
  controllers: [ConsultationController],
  exports: [ConsultationService],
})
export class ConsultationModule {}
