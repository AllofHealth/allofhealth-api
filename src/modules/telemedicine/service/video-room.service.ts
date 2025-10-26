import { Injectable, Logger } from '@nestjs/common';
import { DoxyService } from '@/shared/calender/service/doxy.service';
import { BookingProvider } from '../provider/booking.provider';

@Injectable()
export class VideoRoomService {
    private readonly logger = new Logger(VideoRoomService.name);

    constructor(
        private readonly doxyService: DoxyService,
        private readonly bookingProvider: BookingProvider,
    ) { }

    // Create video room for booking
    async createVideoRoomForBooking(
        bookingId: string,
        doctorId: string,
        doctorName: string,
        patientId: string,
    ) {
        try {
            this.logger.log(`Creating video room for booking ${bookingId}`);

            const videoRoom = await this.doxyService.createDoctorRoom(
                doctorId,
                doctorName,
                patientId,
                bookingId,
            );

            // Update booking with video room details
            await this.bookingProvider.updateVideoRoom(
                bookingId,
                videoRoom.id,
                videoRoom.url,
            );

            this.logger.log(`Video room created: ${videoRoom.url}`);

            return videoRoom;
        } catch (error) {
            this.logger.error('Failed to create video room', error);
            throw error;
        }
    }

    // Get video room URL for booking
    async getVideoRoomUrl(bookingId: string): Promise<string> {
        const booking = await this.bookingProvider.findBookingById(bookingId);

        if (!booking) {
            throw new Error('Booking not found');
        }

        if (!booking.videoRoomUrl) {
            throw new Error('Video room not created for this booking');
        }

        return booking.videoRoomUrl;
    }

    // Check if video room is active
    async isVideoRoomActive(bookingId: string): Promise<boolean> {
        const booking = await this.bookingProvider.findBookingById(bookingId);

        if (!booking) {
            return false;
        }

        // Check if booking is confirmed and has video URL
        return (
            booking.status === 'confirmed' &&
            booking.paymentStatus === 'paid' &&
            !!booking.videoRoomUrl
        );
    }

    //Archive or cleanup video room (optional)
    async archiveVideoRoom(bookingId: string) {
        try {
            this.logger.log(`Archiving video room for booking ${bookingId}`);

            // Doxy.me doesn't require explicit cleanup
            // Rooms are persistent and managed by the provider

            // If you want to track room usage, you can log it here
            this.logger.log(`Video room archived for booking ${bookingId}`);
        } catch (error) {
            this.logger.error('Failed to archive video room', error);
        }
    }
}