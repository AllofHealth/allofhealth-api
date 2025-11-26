import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CalComProvider } from '../provider/cal.com.provider';
import {
  AvailabilityParams,
  BookingResponse,
  CreateBookingParams,
  ICancelBooking,
  ICreateCalUser,
  IRescheduleBooking,
} from '../interface/cal.com.interface';
import { CalComError } from '../error/cal.com.error';

@Injectable()
export class CalComService {
  private readonly baseUrl: string;
  private readonly clientId: string;

  constructor(private readonly calProvider: CalComProvider) {
    this.baseUrl = this.calProvider.baseUrl();
    this.clientId = this.calProvider.clientId();
  }

  private mapCalcomBookingToResponse(calcomBooking: any): BookingResponse {
    return {
      id: calcomBooking.id,
      uid: calcomBooking.uid,
      title: calcomBooking.title || 'Consultation',
      startTime: new Date(calcomBooking.startTime || calcomBooking.start),
      endTime: new Date(calcomBooking.endTime || calcomBooking.end),
      status: calcomBooking.status,
      meetingUrl: calcomBooking.meetingUrl,
      attendees: calcomBooking.attendees || [],
      metadata: calcomBooking.metadata || {},
    };
  }

  async createBooking(ctx: CreateBookingParams) {
    const url = `${this.baseUrl}/bookings`;
    const data = JSON.stringify({
      start: ctx.startTime.toISOString(),
      eventTypeId: ctx.eventTypeId,
      attendee: {
        name: ctx.attendee.name,
        email: ctx.attendee.email,
        timeZone: ctx.attendee.timeZone,
        phoneNumber: ctx.attendee.phoneNumber,
      },
      meetingUrl: ctx.meetingUrl,
      metadata: ctx.metadata || {},
      lengthInMinutes: ctx.lengthInMinutes || 30, //using the default 30mins
    });

    try {
      const response = await this.calProvider.handleCalRequests({
        method: 'POST',
        url,
        data,
        src: 'Create Booking',
      });
      return this.mapCalcomBookingToResponse(response.data);
    } catch (e) {
      throw new InternalServerErrorException(
        new CalComError(
          `An error occurred while creating booking: ${e.message}`,
          {
            cause: e,
          },
        ),
      );
    }
  }

  async getBooking(bookingId: string) {
    const url = `${this.baseUrl}/bookings/${bookingId}`;
    try {
      const response = await this.calProvider.handleCalRequests({
        method: 'GET',
        url,
        src: 'Get Booking',
      });
      return this.mapCalcomBookingToResponse(response.data);
    } catch (e) {
      throw new InternalServerErrorException(
        new CalComError(
          `An error occurred while fetching booking: ${e.message}`,
          {
            cause: e,
          },
        ),
      );
    }
  }

  async getAvailability(ctx: AvailabilityParams) {
    const queryParams = new URLSearchParams({
      eventTypeId: ctx.eventTypeId.toString(),
      startTime: ctx.startDate.toISOString(),
      endTime: ctx.endDate.toISOString(),
      timeZone: ctx.timeZone || 'UTC',
    });

    const url = `${this.baseUrl}/slots/available?${queryParams.toString()}`;
    try {
      const response = await this.calProvider.handleCalRequests({
        method: 'GET',
        url,
        src: 'Get Availability',
      });
      return {
        slots: response.data.slots.map((slot: any) => ({
          start: new Date(slot.time),
          end: new Date(
            new Date(slot.time).getTime() + ctx.lengthInMinutes * 60000,
          ),
          available: true,
        })),
      };
    } catch (e) {
      throw new InternalServerErrorException(
        new CalComError(
          `An error occurred while fetching availability: ${e.message}`,
          {
            cause: e,
          },
        ),
      );
    }
  }

  async cancelBooking(ctx: ICancelBooking) {
    const url = `${this.baseUrl}/bookings/${ctx.bookingId}/cancel`;
    const data = JSON.stringify({
      reason: ctx.reason || 'Booking cancelled by user',
    });
    try {
      const response = await this.calProvider.handleCalRequests({
        method: 'POST',
        url,
        data,
        src: 'Cancel Booking',
      });

      return response.data;
    } catch (e) {
      throw new InternalServerErrorException(
        new CalComError(
          `An error occurred while canceling booking: ${e.message}`,
          {
            cause: e,
          },
        ),
      );
    }
  }

  async rescheduleBooking(ctx: IRescheduleBooking) {
    const url = `${this.baseUrl}/bookings/${ctx.bookingId}/reschedule`;
    const data = JSON.stringify({
      start: ctx.newStartTime.toISOString(),
    });
    try {
      const response = await this.calProvider.handleCalRequests({
        method: 'POST',
        url,
        data,
        src: 'Reschedule Booking',
      });

      return this.mapCalcomBookingToResponse(response.data);
    } catch (e) {
      throw new InternalServerErrorException(
        new CalComError(
          `An error occurred while rescheduling booking: ${e.message}`,
          {
            cause: e,
          },
        ),
      );
    }
  }

  async createManagedUser(ctx: ICreateCalUser) {
    const {
      email,
      name,
      timeFormat = 12,
      weekStart = 'Monday',
      timeZone = 'Africa/Lagos',
      locale = 'en',
      avatarUrl,
      bio = 'Registered practitioner',
      metadata = {
        role: 'DOCTOR',
      },
    } = ctx;
    const url = `${this.baseUrl}/v2/oauth-clients/${this.clientId}/users`;
    const data = JSON.stringify({
      email,
      name,
      timeFormat,
      weekStart,
      timeZone,
      locale,
      avatarUrl,
      bio,
      metadata,
    });
    try {
      const response = await this.calProvider.handleCalRequests({
        method: 'POST',
        url,
        data,
        src: 'Create Managed User',
        reqType: 'MANAGED',
      });

      const responseData = response.data;
      return {
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken,
        id: responseData.user.id,
      };
    } catch (e) {
      throw new InternalServerErrorException(
        new CalComError(
          `An error occurred while creating managed user: ${e.message}`,
          {
            cause: e,
          },
        ),
      );
    }
  }
}
