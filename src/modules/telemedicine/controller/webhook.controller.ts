// src/modules/telemedicine/controller/webhook.controller.ts

import {
    Controller,
    Post,
    Body,
    Headers,
    HttpStatus,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookingOrchestrationService } from '../service/booking-orchestration.service';
import { CalendarIntegrationService } from '@/shared/calender/service/calendar-integration.service';

/**
 * Webhook Controller
 * Handles webhooks from Cal.com, Doxy.me and flutterwave (flutter-incomplete)
 */
@ApiTags('Telemedicine - Webhooks')
@Controller('webhooks')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        private readonly bookingService: BookingOrchestrationService,
        private readonly calendarService: CalendarIntegrationService,
    ) { }

    /**
     * Cal.com webhook handler
     * POST /webhooks/calcom
     * 
     * Handles events:
     * - BOOKING_CREATED
     * - BOOKING_RESCHEDULED
     * - BOOKING_CANCELLED
     */
    @Post('calcom')
    @ApiOperation({ summary: 'Cal.com webhook endpoint' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook processed successfully',
    })
    async handleCalcomWebhook(
        @Headers('x-cal-signature-256') signature: string,
        @Body() payload: any,
    ) {
        try {
            this.logger.log(`Cal.com webhook received: ${payload.triggerEvent}`);

            // Step 1: Verify webhook signature
            const isValid = this.calendarService.verifyCalcomWebhook(
                JSON.stringify(payload),
                signature,
            );

            if (!isValid) {
                this.logger.error('Invalid Cal.com webhook signature');
                throw new BadRequestException('Invalid webhook signature');
            }

            // Step 2: Handle different event types
            switch (payload.triggerEvent) {
                case 'BOOKING_CREATED':
                    await this.handleBookingCreated(payload);
                    break;

                case 'BOOKING_RESCHEDULED':
                    await this.handleBookingRescheduled(payload);
                    break;

                case 'BOOKING_CANCELLED':
                    await this.handleBookingCancelled(payload);
                    break;

                default:
                    this.logger.warn(`Unhandled Cal.com event: ${payload.triggerEvent}`);
            }

            return {
                success: true,
                message: 'Webhook processed',
            };
        } catch (error) {
            this.logger.error('Cal.com webhook processing failed', error);
            throw error;
        }
    }

    /**
     * Handle BOOKING_CREATED event
     */
    private async handleBookingCreated(payload: any) {
        try {
            const booking = payload.payload;

            await this.bookingService.handleCalcomBookingCreated({
                uid: booking.uid,
                title: booking.title,
                startTime: booking.startTime,
                endTime: booking.endTime,
                attendees: booking.attendees,
                metadata: booking.metadata || {},
                eventTypeId: booking.eventTypeId,
            });

            this.logger.log(`Booking created: ${booking.uid}`);
        } catch (error) {
            this.logger.error('Failed to handle booking created', error);
            throw error;
        }
    }

    /**
     * Handle BOOKING_RESCHEDULED event
     */
    private async handleBookingRescheduled(payload: any) {
        try {
            const booking = payload.payload;
            this.logger.log(`Booking rescheduled: ${booking.uid}`);

            // Find existing booking and update
            // Implementation here will be determined by my requirement for reschduling.
            this.logger.warn('Rescheduling not fully implemented yet');
        } catch (error) {
            this.logger.error('Failed to handle booking rescheduled', error);
            throw error;
        }
    }

    /**
     * Handle BOOKING_CANCELLED event
     */
    private async handleBookingCancelled(payload: any) {
        try {
            const booking = payload.payload;
            this.logger.log(`Booking cancelled: ${booking.uid}`);

            // Find and cancel booking logc will be here
            this.logger.warn('Cancellation webhook not fully implemented yet');
        } catch (error) {
            this.logger.error('Failed to handle booking cancelled', error);
            throw error;
        }
    }

    /**
     * Flutterwave webhook handler
     * POST /webhooks/flutterwave
     */
    @Post('flutterwave')
    @ApiOperation({ summary: 'Flutterwave webhook endpoint' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook processed successfully',
    })
    async handleFlutterwaveWebhook(
        @Headers('verif-hash') verifHash: string,
        @Body() payload: any,
    ) {
        try {
            this.logger.log(`Flutterwave webhook received: ${payload.event}`);

            // Verify webhook (Flutterwave sends a hash)
            const expectedHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;

            if (verifHash !== expectedHash) {
                this.logger.error('Invalid Flutterwave webhook hash');
                throw new BadRequestException('Invalid webhook hash');
            }

            // Handle payment events
            switch (payload.event) {
                case 'charge.completed':
                    await this.handlePaymentSucceeded(payload.data);
                    break;

                case 'charge.failed':
                    await this.handlePaymentFailed(payload.data);
                    break;

                default:
                    this.logger.warn(`Unhandled Flutterwave event: ${payload.event}`);
            }

            return {
                success: true,
                message: 'Webhook processed',
            };
        } catch (error) {
            this.logger.error('Flutterwave webhook processing failed', error);
            throw error;
        }
    }

    /**
     * Handle successful payment
     */
    private async handlePaymentSucceeded(data: any) {
        try {
            const bookingId = data.meta?.bookingId || data.tx_ref;
            const paymentIntentId = data.id || data.flw_ref;

            this.logger.log(`Payment succeeded for booking: ${bookingId}`);

            // Confirm the booking
            await this.bookingService.confirmBooking(bookingId, paymentIntentId);

            this.logger.log(`Booking confirmed: ${bookingId}`);
        } catch (error) {
            this.logger.error('Failed to handle payment success', error);
            throw error;
        }
    }

    /**
     * Handle failed payment
     */
    private async handlePaymentFailed(data: any) {
        try {
            const bookingId = data.meta?.bookingId || data.tx_ref;

            this.logger.warn(`Payment failed for booking: ${bookingId}`);

            // Update booking status to payment_failed
            // Implementation depends on your requirements
        } catch (error) {
            this.logger.error('Failed to handle payment failure', error);
            throw error;
        }
    }

    /**
     * Doxy.me webhook handler (if enabled)
     * POST /webhooks/doxy
     */
    @Post('doxy')
    @ApiOperation({ summary: 'Doxy.me webhook endpoint' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook processed successfully',
    })
    async handleDoxyWebhook(
        @Headers('x-doxy-signature') signature: string,
        @Body() payload: any,
    ) {
        try {
            this.logger.log(`Doxy.me webhook received: ${payload.event}`);

            // Verify webhook signature
            const isValid = this.calendarService.verifyDoxyWebhook(
                JSON.stringify(payload),
                signature,
            );

            if (!isValid) {
                this.logger.error('Invalid Doxy.me webhook signature');
                throw new BadRequestException('Invalid webhook signature');
            }

            // Handle Doxy events (if available)
            // - room.joined
            // - room.left
            // - call.completed

            return {
                success: true,
                message: 'Webhook processed',
            };
        } catch (error) {
            this.logger.error('Doxy.me webhook processing failed', error);
            throw error;
        }
    }
}