import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BookingService } from '../service/booking.service';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import {
  GetBookingDto,
  GetDoctorBookingsDto,
  GetPatientBookingsDto,
  InitializeBookingPaymentDto,
} from '../dto/booking.dto';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';

@ApiTags('Booking Operations')
@Controller('booking')
export class BookingController {
  private readonly logger = new MyLoggerService(BookingController.name);
  constructor(private readonly bookingService: BookingService) {}

  @Post('initialize-payment')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Initialize booking payment',
    description:
      'Initializes the payment process for a booking using a payment provider. It generates a payment link that the user can use to complete the payment. This is intended to be used by a patient to pay for their booking.',
  })
  @ApiBody({
    description: 'Data to initialize booking payment',
    type: InitializeBookingPaymentDto,
  })
  @ApiOkResponse({
    description: 'Payment initialized successfully',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Payment initialized successfully',
      data: {
        authorization_url: 'https://checkout.paystack.com/xxxx',
        access_code: 'xxxx',
        reference: 'xxxx',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Booking not found or already paid for.',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Booking not found',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized to perform this action',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error initializing payment',
    },
  })
  async initializeBookingPayment(
    @Ip() ip: string,
    @Body() ctx: InitializeBookingPaymentDto,
  ) {
    this.logger.log(`Initialize payment request from ${ip}`);
    return await this.bookingService.intializeBookingPayment({
      calcomBookingId: ctx.calcomBookingId,
      patientId: ctx.userId,
    });
  }

  @Get('bookingById')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get booking by ID',
    description: 'Retrieves the details of a specific booking using its ID.',
  })
  @ApiQuery({
    name: 'bookingId',
    description: 'The ID of the booking to retrieve.',
    type: String,
    required: true,
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiQuery({
    name: 'userId',
    description: 'The ID of the user making the request.',
    type: String,
    required: true,
    example: 'p1a2b3c4-d5e6-f789-0123-456789abcdef',
  })
  @ApiOkResponse({
    description: 'Booking details retrieved successfully.',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Booking retrieved successfully',
      data: {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        bookingReference: 'AOH-TEL-987654',
        patientId: 'p1a2b3c4-d5e6-f789-0123-456789abcdef',
        doctorId: 'd1a2b3c4-d5e6-f789-0123-456789abcdef',
        consultationId: 'c1a2b3c4-d5e6-f789-0123-456789abcdef',
        consultationDate: '2025-11-10',
        startTime: '2025-11-10T10:00:00.000Z',
        endTime: '2025-11-10T10:30:00.000Z',
        timezone: 'UTC',
        status: 'confirmed',
        paymentStatus: 'paid',
        amount: '5000.00',
        currency: 'NGN',
        paymentIntentId: 'pi_xxxxxxxx',
        paidAt: '2025-11-10T09:05:00.000Z',
        externalProvider: 'calcom',
        externalBookingId: 'cal_booking_12345',
        externalBookingUrl: 'https://cal.com/booking/cal_booking_12345',
        videoRoomId: 'vri_xxxxxxxx',
        videoRoomUrl: 'https://doxy.me/aoh/xxxxxxxx',
        videoPlatform: 'doxy',
        patientNotes: null,
        doctorNotes: null,
        cancelledAt: null,
        cancellationReason: null,
        cancelledBy: null,
        metadata: {},
        createdAt: '2025-11-09',
        updatedAt: '2025-11-10T09:05:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Booking not found.',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.NOT_FOUND,
      message: 'Booking with ID cal_booking_12345 not found.',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized to perform this action.',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      'An internal server error occurred while retrieving the booking.',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error retrieving booking.',
    },
  })
  async getBooking(@Ip() ip: string, @Query() ctx: GetBookingDto) {
    this.logger.log(`Get booking request from ${ip}`);
    return await this.bookingService.getBooking(ctx.bookingId);
  }

  @Get('patient-bookings')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get bookings for a patient',
    description:
      'Retrieves a paginated list of bookings for a specific patient.',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    required: true,
    description: 'The ID of the patient.',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page.',
    example: 12,
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: false,
    description: 'Filter bookings by status.',
  })
  @ApiOkResponse({
    description: 'Patient bookings retrieved successfully.',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Patient bookings retrieved successfully',
      data: [
        {
          bookingId: 'booking-123',
          bookingReference: 'AOH-TEL-123456',
          patientId: 'patient-123',
          doctorId: 'doctor-456',
          patientFullName: 'John Doe',
          doctorFullName: 'Dr. Jane Smith',
          startTime: '2025-11-10T10:00:00.000Z',
          endTime: '2025-11-10T10:30:00.000Z',
          status: 'confirmed',
          videoRoomId: 'video-room-123',
          videoRoomUrl: 'https://doxy.me/room/123',
        },
      ],
      meta: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
        itemsPerPage: 12,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized to perform this action.',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error retrieving patient bookings.',
    },
  })
  async getPatientBookings(
    @Ip() ip: string,
    @Query() ctx: GetPatientBookingsDto,
  ) {
    this.logger.log(
      `Get patient bookings request from ${ip} for patient ${ctx.userId}`,
    );
    return await this.bookingService.getPatientBookings({
      patientId: ctx.userId,
      page: ctx.page,
      limit: ctx.limit,
      status: ctx.status,
    });
  }

  @Get('doctor-bookings')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get bookings for a doctor',
    description:
      'Retrieves a paginated list of bookings for a specific doctor. Supports filtering by date range and booking status. This endpoint is typically used by doctors to view their upcoming appointments, past consultations, or bookings requiring attention.',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    required: true,
    description: 'The unique identifier of the doctor.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination (1-based index). Defaults to 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description:
      'Maximum number of bookings to return per page. Defaults to 12.',
    example: 12,
  })
  @ApiQuery({
    name: 'startDate',
    type: Date,
    required: false,
    description:
      'Start date for filtering bookings (inclusive). Returns bookings scheduled on or after this date. Format: ISO 8601 date-time string.',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    required: false,
    description:
      'End date for filtering bookings (inclusive). Returns bookings scheduled on or before this date. Format: ISO 8601 date-time string.',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: false,
    description:
      'Filter bookings by status. Available values: pending_payment, processing_payment, confirmed, completed, cancelled, no_show.',
    enum: [
      'pending_payment',
      'processing_payment',
      'confirmed',
      'completed',
      'cancelled',
      'no_show',
    ],
    example: 'confirmed',
  })
  @ApiOkResponse({
    description: 'Doctor bookings retrieved successfully.',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Doctor bookings retrieved successfully',
      data: [
        {
          bookingId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          bookingReference: 'AOH-TEL-123456',
          patientId: 'p1a2b3c4-d5e6-f789-0123-456789abcdef',
          doctorId: 'd1a2b3c4-d5e6-f789-0123-456789abcdef',
          patientFullName: 'John Doe',
          doctorFullName: 'Dr. Jane Smith',
          consultationDate: '2025-11-10',
          startTime: '2025-11-10T10:00:00.000Z',
          endTime: '2025-11-10T10:30:00.000Z',
          status: 'confirmed',
          paymentStatus: 'paid',
          amount: '5000.00',
          currency: 'NGN',
          videoRoomId: 'vri_xxxxxxxx',
          videoRoomUrl: 'https://doxy.me/room/123',
          videoPlatform: 'doxy',
        },
      ],
      meta: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
        itemsPerPage: 12,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized to perform this action.',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      'An internal server error occurred while retrieving doctor bookings.',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error retrieving doctor bookings.',
    },
  })
  async getDoctorBookings(
    @Ip() ip: string,
    @Query() ctx: GetDoctorBookingsDto,
  ) {
    this.logger.log(
      `Get doctor bookings request from ${ip} for doctor ${ctx.userId}`,
    );
    return await this.bookingService.getDoctorBookings({
      doctorId: ctx.userId,
      page: ctx.page,
      limit: ctx.limit,
      endDate: ctx.endDate ? new Date(ctx.endDate) : undefined,
      startDate: ctx.startDate ? new Date(ctx.startDate) : undefined,
      status: ctx.status,
    });
  }
}
