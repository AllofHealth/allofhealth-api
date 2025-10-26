import {
    Controller,
    Post,
    Body,
    Headers,
    HttpStatus,
    BadRequestException,
    Logger,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookingOrchestrationService } from '../service/booking-orchestration.service';
import { PaymentService } from '../service/payment.service';
import { CalendarIntegrationService } from '@/shared/calender/service/calendar-integration.service';

type RawBodyRequest<T = Request> = T & { rawBody?: Buffer };

@ApiTags('Telemedicine - Webhooks')
@Controller('webhooks')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        private readonly bookingService: BookingOrchestrationService,
        private readonly paymentService: PaymentService,
        private readonly calendarService: CalendarIntegrationService,
    ) { }

    //Cal.com webhook handler
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

            // Verify webhook signature
            const isValid = this.calendarService.verifyCalcomWebhook(
                JSON.stringify(payload),
                signature,
            );

            if (!isValid) {
                this.logger.error('Invalid Cal.com webhook signature');
                throw new BadRequestException('Invalid webhook signature');
            }

            // Handle different event types
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

    //Flutterwave webhook handler
    @Post('flutterwave')
    @ApiOperation({ summary: 'Flutterwave webhook endpoint' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook processed successfully',
    })
    async handleFlutterwaveWebhook(
        @Headers('verif-hash') verifHash: string,
        @Body() payload: any,
        @Req() req: RawBodyRequest<Request>,
    ) {
        try {
            this.logger.log(`Flutterwave webhook received: ${payload.event}`);

            // Verify webhook hash
            const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(payload);
            const isValid = this.paymentService['flutterwaveService'].verifyWebhookSignature(
                rawBody,
                verifHash,
            );

            if (!isValid) {
                this.logger.error('Invalid Flutterwave webhook signature');
                throw new BadRequestException('Invalid webhook signature');
            }

            // Handle payment events
            switch (payload.event) {
                case 'charge.completed':
                    await this.handlePaymentSuccess(payload.data);
                    break;

                case 'charge.failed':
                    await this.handlePaymentFailed(payload.data);
                    break;

                case 'transfer.completed':
                    this.logger.log('Transfer completed (payout to doctor)');
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

    // Handle BOOKING_CREATED event
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

    // Handle BOOKING_RESCHEDULED event
    private async handleBookingRescheduled(payload: any) {
        try {
            const booking = payload.payload;
            this.logger.log(`Booking rescheduled: ${booking.uid}`);
            // TODO: Implement rescheduling logic
        } catch (error) {
            this.logger.error('Failed to handle booking rescheduled', error);
            throw error;
        }
    }

    // Handle BOOKING_CANCELLED event
    private async handleBookingCancelled(payload: any) {
        try {
            const booking = payload.payload;
            this.logger.log(`Booking cancelled: ${booking.uid}`);
            // TODO: Implement cancellation logic
        } catch (error) {
            this.logger.error('Failed to handle booking cancelled', error);
            throw error;
        }
    }

    // Handle successful payment
    private async handlePaymentSuccess(data: any) {
        try {
            this.logger.log(`Payment succeeded for tx_ref: ${data.tx_ref}`);

            // Use payment service to handle success
            await this.paymentService.handlePaymentSuccess(data);

            this.logger.log(`Payment processed successfully`);
        } catch (error) {
            this.logger.error('Failed to handle payment success', error);
            throw error;
        }
    }

    // Handle failed payment (UPDATED)
    private async handlePaymentFailed(data: any) {
        try {
            const txRef = data.tx_ref;

            this.logger.warn(`Payment failed for tx_ref: ${txRef}`);

            // Update booking status to payment_failed
            // TODO: Implement payment failure handling
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

            // Handle Doxy events (if available) will be finfished up during testing
            //for now, i do not know if this will be possible.
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