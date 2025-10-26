import { PaymentModule } from '@/shared/payment/payment.module';

import { BookingController } from './controller/booking.controller';
import { DoctorScheduleController } from './controller/doctor-schedule.controller';
import { WebhookController } from './controller/webhook.controller';

import { BookingOrchestrationService } from './service/booking-orchestration.service';
import { DoctorAvailabilityService } from './service/doctor-availability.service';
import { PaymentService } from './service/payment.service';
import { NotificationService } from './service/notification.service';
import { VideoRoomService } from './service/video-room.service';

import { BookingProvider } from './provider/booking.provider';
import { ConsultationTypeProvider } from './provider/consultation-type.provider';
import { CalendarIntegrationProvider } from './provider/calendar-integration.provider';

import { Module } from '@nestjs/common';
import { CalendarModule } from '@/shared/modules/calender/calender.module';
import { TelemedicineNotificationsQueueModule } from '@/shared/queues/telemedicine-notifications/telemedicine-notifications.module';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [
    DoctorModule,
    CalendarModule,
    PaymentModule,
    TelemedicineNotificationsQueueModule,
  ],
  controllers: [BookingController, DoctorScheduleController, WebhookController],
  providers: [
    BookingOrchestrationService,
    DoctorAvailabilityService,
    PaymentService,
    NotificationService,
    VideoRoomService,
    BookingProvider,
    ConsultationTypeProvider,
    CalendarIntegrationProvider,
  ],
  exports: [
    BookingOrchestrationService,
    DoctorAvailabilityService,
    PaymentService,
    BookingProvider,
    ConsultationTypeProvider,
  ],
})
export class TelemedicineModule {}
