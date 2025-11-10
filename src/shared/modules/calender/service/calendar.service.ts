import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { Injectable } from '@nestjs/common';
import {
  ICancelBooking,
  IRescheduleBooking,
} from '../../cal.com/interface/cal.com.interface';
import { CalComService } from '../../cal.com/service/cal.com.service';
import { DoxyService } from '../../doxy/service/doxy.service';
import {
  CreateBookingParams,
  ICreateBookingWithVideoRoom,
  IGetAvailability,
  IUpsertCalendarIntegration,
} from '../interface/calendar.interface';
import { CalendarProvider } from '../provider/calendar.provider';

@Injectable()
export class CalendarService {
  private readonly logger = new MyLoggerService(CalendarService.name);

  constructor(
    private readonly calendarProvider: CalendarProvider,
    private readonly calcomService: CalComService,
    private readonly doxyService: DoxyService,
  ) {}

  async createBookingWithVideoRoom(ctx: ICreateBookingWithVideoRoom) {
    const { patientId, doctorInfo, params } = ctx;
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

  async getAvailability(ctx: IGetAvailability) {
    const { endDate, eventTypeId, lengthInMinutes, startDate } = ctx;
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
  async upsertCalendarIntegration(ctx: IUpsertCalendarIntegration) {
    return await this.calendarProvider.upsertCalendarIntegration(ctx);
  }

  async findIntegrationByDoctorId(doctorId: string) {
    return await this.calendarProvider.findIntegrationByDoctorId({
      doctorId,
    });
  }

  async hasActiveIntegration(doctorId: string) {
    return await this.calendarProvider.hasActiveIntegration(doctorId);
  }

  async deactivateIntegration(integrationId: string) {
    return await this.calendarProvider.deactivateIntegration(integrationId);
  }

  async updateLastSyncedAt(integrationId: string) {
    return await this.calendarProvider.updateLastSync(integrationId);
  }
}
