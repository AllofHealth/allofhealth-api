import { Injectable, Logger, Inject } from '@nestjs/common';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import * as schema from '@/schemas/schema';

@Injectable()
export class BookingProvider {
    private readonly logger = new Logger(BookingProvider.name);

    constructor(
        @Inject(DRIZZLE_PROVIDER) private readonly db: Database
    ) { }

    // Create a new booking
    async createBooking(data: {
        bookingReference: string;
        patientId: string;
        doctorId: string;
        consultationTypeId: string;
        consultationDate: Date;
        startTime: Date;
        endTime: Date;
        timezone: string;
        amount: number;
        currency: string;
        externalBookingId?: string;
        externalBookingUrl?: string;
        metadata?: Record<string, any>;
    }) {
        try {
            const [booking] = await this.db
                .insert(schema.consultationBookings)
                .values({
                    bookingReference: data.bookingReference,
                    patientId: data.patientId,
                    doctorId: data.doctorId,
                    consultationTypeId: data.consultationTypeId,
                    consultationDate: data.consultationDate.toISOString(),
                    startTime: data.startTime,
                    endTime: data.endTime,
                    timezone: data.timezone,
                    amount: data.amount.toString(),
                    currency: data.currency,
                    status: 'pending_payment',
                    paymentStatus: 'pending',
                    externalProvider: 'calcom',
                    externalBookingId: data.externalBookingId,
                    externalBookingUrl: data.externalBookingUrl,
                    videoPlatform: 'doxy',
                    metadata: data.metadata || {},
                })
                .returning();

            this.logger.log(`Booking created: ${booking.id}`);
            return booking;
        } catch (error) {
            this.logger.error('Failed to create booking', error);
            throw error;
        }
    }

    // Find booking by ID
    async findBookingById(bookingId: string) {
        const [booking] = await this.db
            .select()
            .from(schema.consultationBookings)
            .where(eq(schema.consultationBookings.id, bookingId))
            .limit(1);

        return booking;
    }

    // Find booking by external Cal.com booking ID
    async findBookingByExternalId(externalBookingId: string) {
        const [booking] = await this.db
            .select()
            .from(schema.consultationBookings)
            .where(
                eq(schema.consultationBookings.externalBookingId, externalBookingId),
            )
            .limit(1);

        return booking;
    }

    //  Find booking by reference
    async findBookingByReference(reference: string) {
        const [booking] = await this.db
            .select()
            .from(schema.consultationBookings)
            .where(eq(schema.consultationBookings.bookingReference, reference))
            .limit(1);

        return booking;
    }

    // Update booking status
    async updateBookingStatus(
        bookingId: string,
        status: string,
        paymentStatus?: string,
    ) {
        const updateData: any = { status };
        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }

        const [booking] = await this.db
            .update(schema.consultationBookings)
            .set(updateData)
            .where(eq(schema.consultationBookings.id, bookingId))
            .returning();

        return booking;
    }

    //Update video room details
    async updateVideoRoom(
        bookingId: string,
        videoRoomId: string,
        videoRoomUrl: string,
    ) {
        const [booking] = await this.db
            .update(schema.consultationBookings)
            .set({
                videoRoomId,
                videoRoomUrl,
            })
            .where(eq(schema.consultationBookings.id, bookingId))
            .returning();

        return booking;
    }

    // Update payment details
    async updatePaymentDetails(
        bookingId: string,
        paymentIntentId: string,
        paidAt?: Date,
    ) {
        const [booking] = await this.db
            .update(schema.consultationBookings)
            .set({
                paymentIntentId,
                paymentStatus: 'paid',
                paidAt: paidAt || new Date(),
            })
            .where(eq(schema.consultationBookings.id, bookingId))
            .returning();

        return booking;
    }

    // Cancel booking
    async cancelBooking(
        bookingId: string,
        cancelledBy: string,
        reason: string,
    ) {
        const [booking] = await this.db
            .update(schema.consultationBookings)
            .set({
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelledBy,
                cancellationReason: reason,
            })
            .where(eq(schema.consultationBookings.id, bookingId))
            .returning();

        return booking;
    }

    // Get patient bookings
    async getPatientBookings(
        patientId: string,
        options?: { status?: string; limit?: number },
    ) {
        let query = this.db
            .select()
            .from(schema.consultationBookings)
            .$dynamic()
            .where(eq(schema.consultationBookings.patientId, patientId))
            .orderBy(desc(schema.consultationBookings.startTime));

        if (options?.status) {
            query = query.where(
                and(
                    eq(schema.consultationBookings.patientId, patientId),
                    eq(schema.consultationBookings.status, options.status),
                ),
            );
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        return await query;
    }

    //Get doctor bookings
    async getDoctorBookings(
        doctorId: string,
        options?: {
            status?: string;
            startDate?: Date;
            endDate?: Date;
            limit?: number;
        },
    ) {
        const conditions = [eq(schema.consultationBookings.doctorId, doctorId)];

        if (options?.status) {
            conditions.push(eq(schema.consultationBookings.status, options.status));
        }

        if (options?.startDate) {
            conditions.push(
                gte(schema.consultationBookings.startTime, options.startDate),
            );
        }

        if (options?.endDate) {
            conditions.push(
                lte(schema.consultationBookings.startTime, options.endDate),
            );
        }

        let query = this.db
            .select()
            .from(schema.consultationBookings)
            .$dynamic()
            .where(and(...conditions))
            .orderBy(desc(schema.consultationBookings.startTime));

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        return await query;
    }

    // Generate unique booking reference
    generateBookingReference(): string {
        const prefix = 'AOH-TEL'; // All of Health Telemedicine
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${timestamp}${random}`;
    }
}