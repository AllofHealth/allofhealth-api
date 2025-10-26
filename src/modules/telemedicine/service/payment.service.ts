
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { FlutterwaveService } from '@/shared/payment/service/flutterwave.service';
import { BookingProvider } from '../provider/booking.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly flutterwaveService: FlutterwaveService,
        private readonly bookingProvider: BookingProvider,
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService,
    ) { }

    // Initialize payment for booking

    async initializePayment(bookingId: string, patientEmail: string, patientName: string) {
        try {
            // Get booking details
            const booking = await this.bookingProvider.findBookingById(bookingId);

            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (booking.paymentStatus === 'paid') {
                throw new BadRequestException('Booking already paid');
            }

            // Update booking status
            await this.bookingProvider.updateBookingStatus(
                bookingId,
                'processing_payment',
                'processing',
            );

            // Initialize Flutterwave payment
            const redirectUrl = `${this.configService.get('APP_URL')}/booking/confirmation/${bookingId}`;

            const paymentResponse = await this.flutterwaveService.initializePayment({
                amount: parseFloat(booking.amount),
                currency: booking.currency,
                email: patientEmail,
                name: patientName,
                txRef: booking.bookingReference,
                redirectUrl,
                metadata: {
                    bookingId: booking.id,
                    doctorId: booking.doctorId,
                    patientId: booking.patientId,
                },
            });

            this.logger.log(`Payment initialized for booking ${bookingId}`);

            return {
                paymentLink: paymentResponse.data.link,
                paymentId: paymentResponse.data.paymentId,
                bookingReference: booking.bookingReference,
            };
        } catch (error) {
            this.logger.error('Failed to initialize payment', error);
            throw error;
        }
    }

    // Handle successful payment webhook

    async handlePaymentSuccess(transactionData: any) {
        try {
            const { tx_ref, id, amount, status, meta } = transactionData;

            this.logger.log(`Processing payment success for ${tx_ref}`);

            // Find booking by reference
            const booking = await this.bookingProvider.findBookingByReference(tx_ref);

            if (!booking) {
                this.logger.error(`Booking not found for tx_ref: ${tx_ref}`);
                return;
            }

            // Verify payment status
            if (status !== 'successful') {
                this.logger.warn(`Payment status is ${status}, not successful`);
                return;
            }

            // Verify amount matches
            if (parseFloat(amount) !== parseFloat(booking.amount)) {
                this.logger.error(
                    `Amount mismatch: expected ${booking.amount}, got ${amount}`,
                );
                return;
            }

            // Update booking payment details
            await this.bookingProvider.updatePaymentDetails(booking.id, id.toString(), new Date());

            // Update booking status to confirmed
            await this.bookingProvider.updateBookingStatus(booking.id, 'confirmed', 'paid');

            // Emit booking confirmed event
            this.eventEmitter.emit('booking.confirmed', {
                bookingId: booking.id,
                patientId: booking.patientId,
                doctorId: booking.doctorId,
                videoRoomUrl: booking.videoRoomUrl,
            });

            this.logger.log(`Payment processed successfully for booking ${booking.id}`);
        } catch (error) {
            this.logger.error('Failed to handle payment success', error);
            throw error;
        }
    }

    // Process refund for cancelled booking

    async processRefund(bookingId: string, reason: string) {
        try {
            const booking = await this.bookingProvider.findBookingById(bookingId);

            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (booking.paymentStatus !== 'paid') {
                throw new BadRequestException('Booking has not been paid');
            }

            if (!booking.paymentIntentId) {
                throw new BadRequestException('Payment intent ID not found');
            }

            // Process refund with Flutterwave
            const refundResponse = await this.flutterwaveService.processRefund(
                booking.paymentIntentId,
            );

            // Update booking
            await this.bookingProvider.updateBookingStatus(bookingId, 'cancelled', 'refunded');

            this.logger.log(`Refund processed for booking ${bookingId}`);

            return {
                refundId: refundResponse.data.id,
                amount: refundResponse.data.amount,
                status: refundResponse.data.status,
            };
        } catch (error) {
            this.logger.error('Failed to process refund', error);
            throw error;
        }
    }

    // Verify payment status

    async verifyPayment(transactionId: string) {
        try {
            const verification = await this.flutterwaveService.verifyPayment(transactionId);
            return verification.data;
        } catch (error) {
            this.logger.error('Failed to verify payment', error);
            throw error;
        }
    }

    // Get payment configuration for frontend

    getPaymentConfig() {
        return this.flutterwaveService.getPaymentConfig();
    }
}