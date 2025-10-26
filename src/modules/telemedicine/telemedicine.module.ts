import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { TelemedicineService } from './telemedicine.service';
import { TelemedicineController } from './telemedicine.controller';
import { Telemedicine } from './telemedicine';

@Module({
  providers: [TelemedicineService, Telemedicine],
  controllers: [TelemedicineController]
})
export class TelemedicineModule {}
=======
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueueModule } from './queue/queue.module';

// Shared Modules
import { CalendarModule } from '@/shared/calender/calender.module';
import { DrizzleModule } from '@/shared/drizzle/drizzle.module'; 
import { PaymentModule } from '@/shared/payment/payment.module'; 

// Controllers
import { BookingController } from './controller/booking.controller';
import { DoctorScheduleController } from './controller/doctor-schedule.controller';
import { WebhookController } from './controller/webhook.controller';

// Services
import { BookingOrchestrationService } from './service/booking-orchestration.service';
import { DoctorAvailabilityService } from './service/doctor-availability.service';
import { PaymentService } from './service/payment.service';
import { NotificationService } from './service/notification.service';
import { VideoRoomService } from './service/video-room.service';

// Providers (Database Access)
import { BookingProvider } from './provider/booking.provider';
import { ConsultationTypeProvider } from './provider/consultation-type.provider';
import { DoctorProvider } from './provider/doctor.provider';
import { CalendarIntegrationProvider } from './provider/calendar-integration.provider';

// Event Listeners
import { BookingEventListeners } from './events/booking.listeners';

//processors
import { NotificationProcessor } from './processors/notification.processor';
import { ReminderProcessor } from './processors/reminder.processor';

@Module({
    imports: [
        ConfigModule,
        EventEmitterModule.forRoot(),
        CalendarModule, 
        DrizzleModule, 
        PaymentModule,
        QueueModule,
    ],
    controllers: [
        BookingController,
        DoctorScheduleController,
        WebhookController,
    ],
    providers: [
        // Services
        BookingOrchestrationService,
        DoctorAvailabilityService,
        PaymentService,
        NotificationService,
        VideoRoomService,

        // Providers (Database)
        BookingProvider,
        ConsultationTypeProvider,
        DoctorProvider,
        CalendarIntegrationProvider,

        // Event Listeners
        BookingEventListeners,

        //processors
        NotificationProcessor,
        ReminderProcessor,
    ],
    exports: [
        BookingOrchestrationService,
        DoctorAvailabilityService,
        PaymentService,
        BookingProvider,
        ConsultationTypeProvider,
        DoctorProvider,
    ],
})
export class TelemedicineModule { }
>>>>>>> 71809c4810ab3cd454a271afc29af3c7eaacff25
