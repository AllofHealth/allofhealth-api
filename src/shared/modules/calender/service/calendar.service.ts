import { Injectable, Logger } from '@nestjs/common';
import {
  BookingResponse,
  CreateBookingParams,
  VideoRoomResponse,
} from '../interface/calendar-provider.interface';
import { CalComService } from '../../cal.com/service/cal.com.service';
import {
  ICancelBooking,
  IRescheduleBooking,
} from '../../cal.com/interface/cal.com.interface';
import { DoxyService } from '../../doxy/service/doxy.service';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@Injectable()
export class CalendarService {
  private readonly logger = new MyLoggerService(CalendarService.name);

  constructor(
    private readonly calcomService: CalComService,
    private readonly doxyService: DoxyService,
  ) {}

  async createBookingWithVideoRoom(
    params: CreateBookingParams,
    doctorInfo: { id: string; name: string },
    patientId: string,
  ): Promise<{
    booking: BookingResponse;
    videoRoom: VideoRoomResponse;
  }> {
    try {
      this.logger.log(
        `Creating booking with video room for patient ${patientId}`,
      );

      const videoRoom = await this.doxyService.createDoctorRoom({
        doctorId: doctorInfo.id,
        bookingId: `temp-${Date.now()}`,
        patientId,
        doctorName: doctorInfo.name,
      });

      const bookingParams: CreateBookingParams = {
        ...params,
        meetingUrl: videoRoom.url, // Pass Doxy link to Cal.com
      };

      const booking = await this.calcomService.createBooking(bookingParams);

      const finalVideoRoom = await this.doxyService.createDoctorRoom({
        bookingId: booking.uid || booking.id.toString(),
        doctorId: doctorInfo.id,
        patientId: patientId,
        doctorName: doctorInfo.name,
      });

      this.logger.log(
        `Booking created successfully: ${booking.uid}, Video: ${finalVideoRoom.url}`,
      );

      return {
        booking,
        videoRoom: finalVideoRoom,
      };
    } catch (error) {
      this.logger.error('Failed to create booking with video room', error);
      throw error;
    }
  }

  async getAvailability(
    eventTypeId: number,
    startDate: Date,
    endDate: Date,
    lengthInMinutes: number = 30,
  ) {
    return (
      this.calcomService.getAvailability({
        eventTypeId,
        startDate,
        endDate,
        timeZone: 'UTC',
        lengthInMinutes,
      }) || {}
    );
  }

  async cancelBooking(ctx: ICancelBooking) {
    return this.calcomService.cancelBooking(ctx);
  }

  async rescheduleBooking(ctx: IRescheduleBooking) {
    return this.calcomService.rescheduleBooking(ctx);
  }

  async getBooking(calcomBookingId: string) {
    return this.calcomService.getBooking(calcomBookingId);
  }
}
