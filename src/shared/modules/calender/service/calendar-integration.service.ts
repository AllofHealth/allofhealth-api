// src/shared/calendar/service/calendar-integration.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { CalcomService } from './calcom.service';
import { DoxyService } from './doxy.service';
import {
    BookingResponse,
    CreateBookingParams,
    VideoRoomResponse,
} from '../interface/calendar-provider.interface';

/**
 * Calendar Integration Service
 * Orchestrates Cal.com bookings + Doxy.me video rooms
 */
@Injectable()
export class CalendarIntegrationService {
    private readonly logger = new Logger(CalendarIntegrationService.name);

    constructor(
        private readonly calcomService: CalcomService,
        private readonly doxyService: DoxyService,
    ) { }

    /**
     * Create complete booking with video room
     * This combines Cal.com booking + Doxy.me room generation
     */
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

            // Step 1: Generate Doxy.me room first
            const videoRoom = await this.doxyService.createDoctorRoom(
                doctorInfo.id,
                doctorInfo.name,
                patientId,
                `temp-${Date.now()}`, // Temporary ID, will update with booking ID
            );

            // Step 2: Create Cal.com booking with the Doxy.me link
            const bookingParams: CreateBookingParams = {
                ...params,
                meetingUrl: videoRoom.url, // Pass Doxy link to Cal.com
            };

            const booking = await this.calcomService.createBooking(bookingParams);

            // Step 3: Update video room with actual booking ID
            const finalVideoRoom = await this.doxyService.createDoctorRoom(
                doctorInfo.id,
                doctorInfo.name,
                patientId,
                booking.uid || booking.id.toString(),
            );

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

    /**
     * Get availability for a doctor's event type
     */
    async getAvailability(eventTypeId: number, startDate: Date, endDate: Date, lengthInMinutes: number = 30) {
        return this.calcomService.getAvailability({
            eventTypeId,
            startDate,
            endDate,
            timeZone: 'UTC',
            lengthInMinutes
        }) || {};
    }

    /**
     * Cancel booking in Cal.com
     */
    async cancelBooking(calcomBookingId: string, reason?: string) {
        return this.calcomService.cancelBooking(calcomBookingId, reason);
    }

    /**
     * Reschedule booking
     */
    async rescheduleBooking(calcomBookingId: string, newStartTime: Date) {
        return this.calcomService.rescheduleBooking(calcomBookingId, newStartTime);
    }

    /**
     * Get booking details from Cal.com
     */
    async getBooking(calcomBookingId: string) {
        return this.calcomService.getBooking(calcomBookingId);
    }

    /**
     * Verify webhook signatures
     */
    verifyCalcomWebhook(payload: string, signature: string): boolean {
        return this.calcomService.verifyWebhookSignature(payload, signature);
    }

    verifyDoxyWebhook(payload: string, signature: string): boolean {
        return this.doxyService.verifyWebhookSignature(payload, signature);
    }
}