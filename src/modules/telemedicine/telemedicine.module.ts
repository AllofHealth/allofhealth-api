import { CalendarModule } from '@/shared/modules/calender/calender.module';
import { FlutterwaveModule } from '@/shared/modules/flutterwave/flutterwave.module';
import { TelemedicineNotificationsQueueModule } from '@/shared/queues/telemedicine-notifications/telemedicine-notifications.module';
import { forwardRef, Module } from '@nestjs/common';
import { BookingModule } from '../booking/booking.module';
import { ConsultationModule } from '../consultation/consultation.module';
import { DoctorModule } from '../doctor/doctor.module';
import { TelemedicineService } from './service/telemedicine.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { UserModule } from '../user/user.module';
import { TelemedicineController } from './controller/telemedicine.controller';

@Module({
  imports: [
    forwardRef(() => UserModule),
    DoctorModule,
    CalendarModule,
    BookingModule,
    TelemedicineNotificationsQueueModule,
    FlutterwaveModule,
    ConsultationModule,
  ],
  providers: [TelemedicineService, ErrorHandler],
  controllers: [TelemedicineController],
})
export class TelemedicineModule {}
