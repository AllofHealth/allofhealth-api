import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ICalendarProvider,
  CreateBookingParams,
  BookingResponse,
  AvailabilityParams,
  AvailabilityResponse,
} from '../interface/calendar-provider.interface';

@Injectable()
export class CalcomService implements ICalendarProvider {
  private readonly logger = new Logger(CalcomService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly apiVersion: string = '2024-08-13';

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('calcom.apiUrl') || '';
    this.apiKey = this.configService.get<string>('calcom.apiKey') || '';

    if (!this.apiKey || this.apiKey == '') {
      this.logger.warn('Cal.com API key not configured');
        throw new Error('API URL is required');
    }
  }

  // Create a booking in Cal.com
  async createBooking(params: CreateBookingParams): Promise<BookingResponse> {
    try {
      this.logger.log(`Creating Cal.com booking for ${params.attendee.email}`);

      const response = await fetch(`${this.apiUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'cal-api-version': this.apiVersion,
        },
        body: JSON.stringify({
          start: params.startTime.toISOString(),
          eventTypeId: params.eventTypeId,
          attendee: {
            name: params.attendee.name,
            email: params.attendee.email,
            timeZone: params.attendee.timeZone,
            phoneNumber: params.attendee.phoneNumber,
          },
          meetingUrl: params.meetingUrl,
          metadata: params.metadata || {},
          lengthInMinutes: params.lengthInMinutes || 30, //using the default 30mins
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('Cal.com booking creation failed', error);
        throw new HttpException(
          `Cal.com API Error: ${error.message || 'Unknown error'}`,
          response.status,
        );
      }

      const data = await response.json();
      this.logger.log(`Cal.com booking created successfully: ${data.data.uid}`);

      return this.mapCalcomBookingToResponse(data.data);
    } catch (error) {
      this.logger.error('Failed to create Cal.com booking', error);
      throw error;
    }
  }

  // Get availability slots from Cal.com
  async getAvailability(
    params: AvailabilityParams,
  ): Promise<AvailabilityResponse> {
    try {
      this.logger.log(`Fetching availability for event type ${params.eventTypeId}`);

      const queryParams = new URLSearchParams({
        eventTypeId: params.eventTypeId.toString(),
        startTime: params.startDate.toISOString(),
        endTime: params.endDate.toISOString(),
        timeZone: params.timeZone || 'UTC',
      });

      const response = await fetch(
        `${this.apiUrl}/slots/available?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'cal-api-version': this.apiVersion,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          `Cal.com API Error: ${error.message}`,
          response.status,
        );
      }

      const data = await response.json();
      
      return {
        slots: data.data.slots.map((slot: any) => ({
          start: new Date(slot.time),
          end: new Date(
            new Date(slot.time).getTime() + params.lengthInMinutes * 60000,
          ),
          available: true,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to fetch availability', error);
      throw error;
    }
  }

  // Cancel a booking in Cal.com
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    try {
      this.logger.log(`Cancelling Cal.com booking: ${bookingId}`);

      const response = await fetch(`${this.apiUrl}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'cal-api-version': this.apiVersion,
        },
        body: JSON.stringify({
          reason: reason || 'Booking cancelled by user',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          `Cal.com API Error: ${error.message}`,
          response.status,
        );
      }

      this.logger.log(`Booking ${bookingId} cancelled successfully`);
    } catch (error) {
      this.logger.error('Failed to cancel booking', error);
      throw error;
    }
  }

  // Reschedule a booking
  async rescheduleBooking(
    bookingId: string,
    newStartTime: Date,
  ): Promise<BookingResponse> {
    try {
      this.logger.log(`Rescheduling booking ${bookingId}`);

      const response = await fetch(`${this.apiUrl}/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'cal-api-version': this.apiVersion,
        },
        body: JSON.stringify({
          start: newStartTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          `Cal.com API Error: ${error.message}`,
          response.status,
        );
      }

      const data = await response.json();
      return this.mapCalcomBookingToResponse(data.data);
    } catch (error) {
      this.logger.error('Failed to reschedule booking', error);
      throw error;
    }
  }

  // Get booking details 
  async getBooking(bookingId: string): Promise<BookingResponse> {
    try {
      this.logger.log(`Fetching booking details: ${bookingId}`);

      const response = await fetch(`${this.apiUrl}/bookings/${bookingId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'cal-api-version': this.apiVersion,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          `Cal.com API Error: ${error.message}`,
          response.status,
        );
      }

      const data = await response.json();
      return this.mapCalcomBookingToResponse(data.data);
    } catch (error) {
      this.logger.error('Failed to fetch booking details', error);
      throw error;
    }
  }

  // Map Cal.com booking response to our standard format
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

  // Verify Cal.com webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = this.configService.get<string>('calcom.webhookSecret');
    
    if (!webhookSecret) {
      this.logger.warn('Webhook secret not configured');
      return false;
    }

    // Cal.com uses HMAC SHA256 for webhook signatures
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = hmac.update(payload).digest('hex');
    
    return digest === signature;
  }
}