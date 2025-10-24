import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { BookingOrchestrationService } from '../service/booking-orchestration.service';

/**
 * Booking Controller
 * Handles patient booking operations
 */
@ApiTags('Telemedicine - Bookings')
@Controller('telemedicine/bookings')
// @UseGuards(JwtAuthGuard) // Uncomment when auth  is ready (dON'T FOEGET TO TALK TO CHIKE ABOUT THIS)
export class BookingController {
    constructor(
        private readonly bookingService: BookingOrchestrationService,
    ) { }

    /**
     * Initialize payment for a booking
     * POST /telemedicine/bookings/initialize-payment
     */
    @Post('initialize-payment')
    @ApiOperation({ summary: 'Initialize payment for a Cal.com booking' })
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment initialized successfully',
    })
    async initializePayment(
        @Request() req: any,
        @Body() body: { calcomBookingId: string },
    ) {
        // Get patient ID from authenticated user
        const patientId = req.user?.id || 'patient-id-from-token';

        const paymentData = await this.bookingService.initializePayment(
            body.calcomBookingId,
            patientId,
        );

        return {
            success: true,
            message: 'Payment session initialized',
            data: paymentData,
        };
    }

    /**
     * Get booking details
     * GET /telemedicine/bookings/:bookingId
     */
    @Get(':bookingId')
    @ApiOperation({ summary: 'Get booking details' })
    @ApiBearerAuth()
    @ApiParam({ name: 'bookingId', description: 'Booking ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Booking details retrieved',
    })
    async getBooking(@Param('bookingId') bookingId: string) {
        const booking = await this.bookingService.getBooking(bookingId);

        return {
            success: true,
            data: booking,
        };
    }

    /**
     * Cancel a booking
     * POST /telemedicine/bookings/:bookingId/cancel
     */
    @Post(':bookingId/cancel')
    @ApiOperation({ summary: 'Cancel a booking' })
    @ApiBearerAuth()
    @ApiParam({ name: 'bookingId', description: 'Booking ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Booking cancelled successfully',
    })
    async cancelBooking(
        @Param('bookingId') bookingId: string,
        @Request() req: any,
        @Body() body: { reason: string },
    ) {
        const userId = req.user?.id || 'user-id-from-token';

        const cancelledBooking = await this.bookingService.cancelBooking(
            bookingId,
            userId,
            body.reason,
        );

        return {
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking,
        };
    }

    /**
     * Get video room link
     * GET /telemedicine/bookings/:bookingId/video-link
     */
    @Get(':bookingId/video-link')
    @ApiOperation({ summary: 'Get video consultation link' })
    @ApiBearerAuth()
    @ApiParam({ name: 'bookingId', description: 'Booking ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Video link retrieved',
    })
    async getVideoLink(@Param('bookingId') bookingId: string) {
        const booking = await this.bookingService.getBooking(bookingId);

        if (booking.status !== 'confirmed') {
            return {
                success: false,
                message: 'Booking not confirmed yet',
            };
        }

        return {
            success: true,
            data: {
                videoRoomUrl: booking.videoRoomUrl,
                bookingId: booking.id,
                startTime: booking.startTime,
            },
        };
    }

    /**
     * Get my bookings (patient)
     * GET /telemedicine/bookings/me/list
     */
    @Get('me/list')
    @ApiOperation({ summary: 'Get my bookings as a patient' })
    @ApiBearerAuth()
    @ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter by status',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Patient bookings retrieved',
    })
    async getMyBookings(
        @Request() req: any,
        @Query('status') status?: string,
    ) {
        const patientId = req.user?.id || 'patient-id-from-token';

        const bookings = await this.bookingService.getPatientBookings(
            patientId,
            status,
        );

        return {
            success: true,
            data: bookings,
            count: bookings.length,
        };
    }

    /**
     * Get doctor's bookings
     * GET /telemedicine/bookings/doctor/list
     */
    @Get('doctor/list')
    @ApiOperation({ summary: 'Get my bookings as a doctor' })
    @ApiBearerAuth()
    @ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter by status',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        description: 'Start date filter',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        description: 'End date filter',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Doctor bookings retrieved',
    })
    async getDoctorBookings(
        @Request() req: any,
        @Query('status') status?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const doctorId = req.user?.doctorId || 'doctor-id-from-token';

        const bookings = await this.bookingService.getDoctorBookings(doctorId, {
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });

        return {
            success: true,
            data: bookings,
            count: bookings.length,
        };
    }
}