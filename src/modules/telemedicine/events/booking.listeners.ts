// src/modules/telemedicine/events/booking.listeners.ts

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
    BookingCreatedEvent,
    BookingConfirmedEvent,
    BookingCancelledEvent,
    BookingCompletedEvent,
} from './booking.events';

/**
 * Booking Event Listeners
 * Handles side effects when booking events occur
 * Talk to 3ill about this Inah. you need to handle the event returns accurately.
 */
@Injectable()
export class BookingEventListeners {
    private readonly logger = new Logger(BookingEventListeners.name);

    /**
     * Handle booking created event
     * Triggered when a new booking is created from Cal.com webhook
     */
    @OnEvent('booking.created')
    async handleBookingCreated(event: BookingCreatedEvent) {
        try {
            this.logger.log(`Booking created: ${event.bookingId}`);

            // INah TODO: Future implementations
            // 1. Send initial booking notification to patient
            // 2. Lock time slot in Redis
            // 3. Log audit trail
            // 4. Queue reminder jobs

            this.logger.log('Booking created event processed successfully');
        } catch (error) {
            this.logger.error('Failed to handle booking created event', error);
        }
    }

    /**
     * Handle booking confirmed event
     * Triggered when payment succeeds and booking is confirmed
     */
    @OnEvent('booking.confirmed')
    async handleBookingConfirmed(event: BookingConfirmedEvent) {
        try {
            this.logger.log(`Booking confirmed: ${event.bookingId}`);

            // INah TODO: Future implementations
            // 1. Send confirmation email to patient with video link
            // 2. Send notification to doctor
            // 3. Generate ICS calendar file
            // 4. Schedule reminder notifications (24h, 1h before). email reminders.
            // 5. Release Redis slot lock
            // 6. Update analytics

            this.logger.log('Booking confirmed event processed successfully');
        } catch (error) {
            this.logger.error('Failed to handle booking confirmed event', error);
        }
    }

    /**
     * Handle booking cancelled event
     * Triggered when booking is cancelled by patient/doctor
     */
    @OnEvent('booking.cancelled')
    async handleBookingCancelled(event: BookingCancelledEvent) {
        try {
            this.logger.log(`Booking cancelled: ${event.bookingId}`);

            // Inah cancellation TODO: Future implementations
            // 1. Process refund if payment was made
            // 2. Send cancellation email to both parties
            // 3. Cancel scheduled reminder jobs
            // 4. Release slot lock
            // 5. Update availability
            // 6. Log cancellation for analytics

            this.logger.log('Booking cancelled event processed successfully');
        } catch (error) {
            this.logger.error('Failed to handle booking cancelled event', error);
        }
    }

    /**
     * Handle booking completed event
     * Triggered when consultation finishes
     */
    @OnEvent('booking.completed')
    async handleBookingCompleted(event: BookingCompletedEvent) {
        try {
            this.logger.log(`Booking completed: ${event.bookingId}`);

            // Inah TODOs: Future implementations
            // 1. Send follow-up survey to patient
            // 2. Request review/rating
            // 3. Trigger payout to doctor
            // 4. Archive video recording (if enabled)
            // 5. Update consultation history
            // 6. Award tokens/rewards if applicable

            this.logger.log('Booking completed event processed successfully');
        } catch (error) {
            this.logger.error('Failed to handle booking completed event', error);
        }
    }
}