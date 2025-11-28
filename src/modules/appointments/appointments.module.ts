import { Module } from '@nestjs/common';
import { AppointmentsService } from './service/appointments.service';
import { AppointmentsProvider } from './provider/appointments.provider';
import { AppointmentsController } from './controller/appointments.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [AppointmentsService, AppointmentsProvider, ErrorHandler],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
