import { Module } from '@nestjs/common';
import { BookingService } from './service/booking.service';
import { BookingController } from './controller/booking.controller';
import { BookingProvider } from './provider/booking.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [BookingProvider, BookingService, ErrorHandler],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
