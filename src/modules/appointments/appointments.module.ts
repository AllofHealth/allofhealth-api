import { Module } from '@nestjs/common';
import { AppointmentsService } from './service/appointments.service';
import { AppointmentsProvider } from './provider/appointments.provider';
import { AppointmentsController } from './controller/appointments.controller';

@Module({
  providers: [AppointmentsService, AppointmentsProvider],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
