// src/modules/telemedicine/telemedicine.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Shared Modules
import { CalendarModule } from '@/shared/calender/calender.module';
import { DrizzleModule } from '@/shared/drizzle/drizzle.module'; 

// Controllers
import { BookingController } from './controller/booking.controller';
import { DoctorScheduleController } from './controller/doctor-schedule.controller';
import { WebhookController } from './controller/webhook.controller';

// Services
import { BookingOrchestrationService } from './service/booking-orchestration.service';
import { DoctorAvailabilityService } from './service/doctor-availability.service';

// Providers (Database Access)
import { BookingProvider } from './provider/booking.provider';
import { ConsultationTypeProvider } from './provider/consultation-type.provider';
import { DoctorProvider } from './provider/doctor.provider';
import { CalendarIntegrationProvider } from './provider/calendar-integration.provider';

// Event Listeners
import { BookingEventListeners } from './events/booking.listeners';

@Module({
    imports: [
        ConfigModule,
        EventEmitterModule.forRoot(),
        CalendarModule, 
        DrizzleModule, 
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

        // Providers (Database)
        BookingProvider,
        ConsultationTypeProvider,
        DoctorProvider,
        CalendarIntegrationProvider,

        // Event Listeners
        BookingEventListeners,
    ],
    exports: [
        BookingOrchestrationService,
        DoctorAvailabilityService,
        BookingProvider,
        ConsultationTypeProvider,
        DoctorProvider,
    ],
})
export class TelemedicineModule { }