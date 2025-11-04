import { BookingController } from './controller/booking.controller';
import { DoctorScheduleController } from './controller/doctor-schedule.controller';
import { WebhookController } from './controller/webhook.controller';

import { DoctorAvailabilityService } from './service/doctor-availability.service';
import { NotificationService } from './service/notification.service';

import { CalendarModule } from '@/shared/modules/calender/calender.module';
import { FlutterwaveModule } from '@/shared/modules/flutterwave/flutterwave.module';
import { TelemedicineNotificationsQueueModule } from '@/shared/queues/telemedicine-notifications/telemedicine-notifications.module';
import { Module } from '@nestjs/common';
import { BookingModule } from '../booking/booking.module';
import { ConsultationModule } from '../consultation/consultation.module';
import { DoctorModule } from '../doctor/doctor.module';
import { TelemedicineService } from './service/telemedicine.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  imports: [
    DoctorModule,
    CalendarModule,
    BookingModule,
    TelemedicineNotificationsQueueModule,
    FlutterwaveModule,
    ConsultationModule,
  ],
  providers: [
    DoctorAvailabilityService,
    NotificationService,
    TelemedicineService,
    ErrorHandler,
  ],
  controllers: [BookingController, DoctorScheduleController, WebhookController],
})
export class TelemedicineModule {}
