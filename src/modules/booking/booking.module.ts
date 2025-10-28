import { Module } from '@nestjs/common';
import { BookingService } from './service/booking.service';
import { BookingController } from './controller/booking.controller';
import { BookingProvider } from './provider/booking.provider';

@Module({
  providers: [BookingProvider, BookingService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
