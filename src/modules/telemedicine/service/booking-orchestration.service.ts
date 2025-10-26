// src/modules/telemedicine/service/booking-orchestration.service.ts

import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingProvider } from '../provider/booking.provider';
import { ConsultationTypeProvider } from '../provider/consultation-type.provider';
import { CalendarIntegrationService } from '@/shared/calender/service/calendar-integration.service';
import { DoxyService } from '@/shared/calender/service/doxy.service';

/**
 * Booking Orchestration Service
 * Coordinates the complete booking lifecycle
 */
@Injectable()
export class BookingOrchestrationService {
    private readonly logger = new Logger(BookingOrchestrationService.name);

    constructor(
        private readonly bookingProvider: BookingProvider,
        private readonly consultationTypeProvider: ConsultationTypeProvider,
        private readonly calendarService: CalendarIntegrationService,
        private readonly doxyService: DoxyService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    /**
     * Process Cal.com webhook booking creation
     * This is called when Cal.com sends BOOKING_CREATED webhook
     */
    async handleCalcomBookingCreated(webhookData: {
        uid: string;
        title: string;
        startTime: string;
        endTime: string;
        attendees: Array<{ name: string; email: string; timeZone: string }>;
        metadata: Record<string, any>;
        eventTypeId: number;
    }) {
        try {
            this.logger.log(`Processing Cal.com booking: ${webhookData.uid}`);

            // Step 1: Check if booking already exists
            const existingBooking =
                await this.bookingProvider.findBookingByExternalId(webhookData.uid);

            if (existingBooking) {
                this.logger.warn(`Booking already exists: ${webhookData.uid}`);
                return existingBooking;
            }

            // Step 2: Get consultation type from Cal.com event type
            const consultationType =
                await this.consultationTypeProvider.findByCalcomEventTypeId(
                    webhookData.eventTypeId,
                );

            if (!consultationType) {
                throw new NotFoundException(
                    `Consultation type not found for event type ${webhookData.eventTypeId}`,
                );
            }

            // Step 3: Extract patient and doctor info from metadata
            const patientId = webhookData.metadata.patientId;
            const doctorId = consultationType.doctorId;

            if (!patientId) {
                throw new BadRequestException('Patient ID not found in booking metadata');
            }

            // Step 4: Create booking record
            const bookingReference = this.bookingProvider.generateBookingReference();

            const booking = await this.bookingProvider.createBooking({
                bookingReference,
                patientId,
                doctorId,
                consultationTypeId: consultationType.id,
                consultationDate: new Date(webhookData.startTime),
                startTime: new Date(webhookData.startTime),
                endTime: new Date(webhookData.endTime),
                timezone: webhookData.attendees[0]?.timeZone || 'UTC',
                amount: parseFloat(consultationType.price),
                currency: consultationType.currency,
                externalBookingId: webhookData.uid,
                externalBookingUrl: `https://cal.com/booking/${webhookData.uid}`,
                metadata: webhookData.metadata,
            });

            this.logger.log(`Booking created: ${booking.id}`);

            // Step 5: Emit event for further processing (payment, notifications)...
            this.eventEmitter.emit('booking.created', {
                bookingId: booking.id,
                patientId,
                doctorId,
                amount: parseFloat(consultationType.price),
            });

            return booking;
        } catch (error) {
            this.logger.error('Failed to handle Cal.com booking creation', error);
            throw error;
        }
    }

    /**
     * Initialize payment for a booking
     * Called when user is ready to pay
     */
    async initializePayment(calcomBookingId: string, patientId: string) {
        try {
            this.logger.log(`Initializing payment for booking: ${calcomBookingId}`);

            // Step 1: Find or create booking
            let booking =
                await this.bookingProvider.findBookingByExternalId(calcomBookingId);

            if (!booking) {
                // Fallback: Fetch from Cal.com and create booking
                this.logger.warn(
                    `Booking not found, fetching from Cal.com: ${calcomBookingId}`,
                );
                const calcomBooking =
                    await this.calendarService.getBooking(calcomBookingId);

                // Create booking from Cal.com data (simplified)
                throw new NotFoundException(
                    'Booking not found. Please try booking again.',
                );
            }

            // Step 2: Verify booking belongs to patient
            if (booking.patientId !== patientId) {
                throw new BadRequestException('Booking does not belong to this patient');
            }

            // Step 3: Check booking status
            if (booking.paymentStatus === 'paid') {
                throw new BadRequestException('Booking already paid');
            }

            // Step 4: Update status to processing
            await this.bookingProvider.updateBookingStatus(
                booking.id,
                'processing_payment',
                'processing',
            );

            // Step 5: Return payment initialization data
            // (Payment service will handle actual Flutterwave integration)
            return {
                bookingId: booking.id,
                bookingReference: booking.bookingReference,
                amount: parseFloat(booking.amount),
                currency: booking.currency,
                patientId: booking.patientId,
                doctorId: booking.doctorId,
                // clientSecret will be added by payment service
            };
        } catch (error) {
            this.logger.error('Failed to initialize payment', error);
            throw error;
        }
    }

    //Confirm booking after successful payment
    async confirmBooking(bookingId: string, paymentIntentId: string) {
        try {
            this.logger.log(`Confirming booking: ${bookingId}`);

            // Step 1: Get booking
            const booking = await this.bookingProvider.findBookingById(bookingId);

            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            // Step 2: Update payment details
            await this.bookingProvider.updatePaymentDetails(
                bookingId,
                paymentIntentId,
                new Date(),
            );

            // Step 3: Update booking status
            await this.bookingProvider.updateBookingStatus(
                bookingId,
                'confirmed',
                'paid',
            );

            // Step 4: Create video room
            const videoRoom = await this.createVideoRoom(booking);

            // Step 5: Update booking with video room
            await this.bookingProvider.updateVideoRoom(
                bookingId,
                videoRoom.id,
                videoRoom.url,
            );

            this.logger.log(`Booking confirmed: ${bookingId}`);

            // Step 6: Emit confirmed event
            this.eventEmitter.emit('booking.confirmed', {
                bookingId: booking.id,
                patientId: booking.patientId,
                doctorId: booking.doctorId,
                videoRoomUrl: videoRoom.url,
            });

            return await this.bookingProvider.findBookingById(bookingId);
        } catch (error) {
            this.logger.error('Failed to confirm booking', error);
            throw error;
        }
    }

    // Create Doxy.me video room for consultation
    private async createVideoRoom(booking: any) {
        try {
            // Get doctor info (you'll need to inject doctor service)
            const doctorName = 'Dr. Smith'; // Replace with actual doctor name fetch

            const videoRoom = await this.doxyService.createDoctorRoom(
                booking.doctorId,
                doctorName,
                booking.patientId,
                booking.id,
            );

            this.logger.log(`Video room created: ${videoRoom.url}`);
            return videoRoom;
        } catch (error) {
            this.logger.error('Failed to create video room', error);
            // Don't fail the whole booking if video room fails
            // Return a fallback
            return {
                id: `fallback-${booking.id}`,
                url: '',
            };
        }
    }

    /**
     * Cancel a booking
     */
    async cancelBooking(
        bookingId: string,
        cancelledBy: string,
        reason: string,
    ) {
        try {
            this.logger.log(`Cancelling booking: ${bookingId}`);

            const booking = await this.bookingProvider.findBookingById(bookingId);

            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            // Cancel in Cal.com
            if (booking.externalBookingId) {
                await this.calendarService.cancelBooking(
                    booking.externalBookingId,
                    reason,
                );
            }

            // Update booking in database
            await this.bookingProvider.cancelBooking(bookingId, cancelledBy, reason);

            // Emit cancellation event (for refund processing)
            this.eventEmitter.emit('booking.cancelled', {
                bookingId: booking.id,
                patientId: booking.patientId,
                doctorId: booking.doctorId,
                paymentStatus: booking.paymentStatus,
                amount: parseFloat(booking.amount),
            });

            return await this.bookingProvider.findBookingById(bookingId);
        } catch (error) {
            this.logger.error('Failed to cancel booking', error);
            throw error;
        }
    }

    /**
     * Get booking details
     */
    async getBooking(bookingId: string) {
        const booking = await this.bookingProvider.findBookingById(bookingId);

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    /**
     * Get patient bookings
     */
    async getPatientBookings(patientId: string, status?: string) {
        return await this.bookingProvider.getPatientBookings(patientId, {
            status,
            limit: 50,
        });
    }

    /**
     * Get doctor bookings
     */
    async getDoctorBookings(
        doctorId: string,
        options?: { status?: string; startDate?: Date; endDate?: Date },
    ) {
        return await this.bookingProvider.getDoctorBookings(doctorId, {
            ...options,
            limit: 100,
        });
    }
}