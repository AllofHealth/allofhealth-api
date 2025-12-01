import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './service/booking.service';
import { BookingController } from './controller/booking.controller';
import { BookingProvider } from './provider/booking.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { ConsultationModule } from '../consultation/consultation.module';
import { CalendarModule } from '@/shared/modules/calender/calender.module';
import { FlutterwaveModule } from '@/shared/modules/flutterwave/flutterwave.module';
import { UserModule } from '../user/user.module';
import { DoxyModule } from '@/shared/modules/doxy/doxy.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    forwardRef(() => TokenModule),
    forwardRef(() => UserModule),
    ConsultationModule,
    CalendarModule,
    FlutterwaveModule,
    DoxyModule,
  ],
  providers: [BookingProvider, BookingService, ErrorHandler],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
