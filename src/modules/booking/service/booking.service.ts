import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BookingProvider } from '../provider/booking.provider';
import {
  ICancelBooking,
  IConfirmBooking,
  ICreateVideoRoomForBooking,
  IGetDoctorBookings,
  IGetPatientBookings,
  IHandleCalComBookingCreated,
  IHandlePaymentSuccess,
  IInititalizeBookingPayment,
  IProcessBookingRefund,
} from '../interface/booking.interface';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ConsultationService } from '@/modules/consultation/service/consultation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/shared.events';
import {
  BookingCancelledEvent,
  BookingConfirmedEvent,
  BookingCreatedEvent,
} from '@/shared/dtos/event.dto';
import { BookingError } from '../error/booking.error';
import { CalendarService } from '@/shared/modules/calender/service/calendar.service';
import { FlutterwaveService } from '@/shared/modules/flutterwave/service/flutterwave.service';
import { UserService } from '@/modules/user/service/user.service';
import { DoxyService } from '@/shared/modules/doxy/service/doxy.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Injectable()
export class BookingService {
  private readonly logger = new MyLoggerService(BookingService.name);
  constructor(
    private readonly handler: ErrorHandler,
    private readonly bookingProvider: BookingProvider,
    private readonly consultationService: ConsultationService,
    private readonly calendarService: CalendarService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly userService: UserService,
    private readonly doxyService: DoxyService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async handleCalComBookingCreated(ctx: IHandleCalComBookingCreated) {
    this.logger.log(
      `Processing Cal.com booking: ${ctx.uid}. Event Id: ${ctx.eventTypeId}`,
    );

    const { attendees, endTime, eventTypeId, metadata, startTime, title, uid } =
      ctx;
    try {
      const existingBooking = await this.bookingProvider.findBooking({
        opts: 'ext_id',
        extId: uid,
      });

      if (existingBooking) {
        this.logger.warn(`Booking already exists: ${uid}`);
        return existingBooking;
      }

      const consultationType = await this.consultationService.findById(
        metadata.consultationId,
      );

      if (!consultationType || !consultationType.data) {
        throw new NotFoundException(
          `Consultation type not found for event type ${eventTypeId}`,
        );
      }

      const patientId = metadata.patientId;
      const doctorId = consultationType.data.doctorId;

      if (!patientId) {
        throw new BadRequestException(
          'Patient ID not found in booking metadata',
        );
      }

      const bookingReference = this.bookingProvider.generateBookingReference();

      const booking = await this.bookingProvider.createBooking({
        bookingReference,
        patientId,
        doctorId,
        consultationId: consultationType.data.id,
        consultationDate: new Date(startTime),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        timezone: attendees[0]?.timeZone || 'UTC',
        amount: parseFloat(consultationType.data.price),
        currency: consultationType.data.currency,
        externalBookingId: uid,
        externalBookingUrl: `https://cal.com/booking/${uid}`,
        metadata: metadata,
      });

      if (!booking || !booking.data) {
        throw new BookingError(
          booking?.message || 'An error occurred while creating booking',
        );
      }

      this.eventEmitter.emit(
        SharedEvents.BOOKING_CREATED,
        new BookingCreatedEvent(
          booking.data.bookingId,
          patientId,
          doctorId,
          parseFloat(consultationType.data.price),
        ),
      );

      return booking;
    } catch (e) {
      throw new InternalServerErrorException(
        e || 'An error occurred while processing the booking',
      );
    }
  }

  async intializeBookingPayment(ctx: IInititalizeBookingPayment) {
    const { calcomBookingId, patientId } = ctx;
    try {
      const bookingResult = await this.bookingProvider.findBooking({
        opts: 'ext_id',
        extId: calcomBookingId,
      });

      let booking: any = bookingResult?.data;

      if (!booking) {
        this.logger.warn(
          `Booking not found, fetching from Cal.com: ${calcomBookingId}`,
        );
        const calcomBooking =
          await this.calendarService.getBooking(calcomBookingId);

        if (!calcomBooking) {
          throw new NotFoundException(
            'Booking not found. Please try booking again.',
          );
        }

        booking = calcomBooking;
      }

      if (booking.patientId !== patientId) {
        throw new BadRequestException(
          'Booking does not belong to this patient',
        );
      }

      if (booking.paymentStatus === 'paid') {
        throw new BadRequestException('Booking already paid');
      }

      await this.bookingProvider.updateBookingStatus({
        bookingId: booking.id,
        status: 'processing_payment',
        paymentStatus: 'processing',
      });

      const user = await this.userService.findUser(booking.patientId);
      if (!user || !user.data) {
        throw new NotFoundException('User not found');
      }

      const paymentResponse = await this.flutterwaveService.initializePayment({
        txRef: booking.bookingReference,
        amount: parseFloat(booking.amount),
        currency: booking.currency,
        email: user.data.email,
        name: user.data.fullName,
        phoneNumber: user.data.phoneNumber,
      });

      return {
        status: HttpStatus.OK,
        message: 'Payment initialized successfully',
        data: {
          paymentLink: paymentResponse.link,
          paymentId: paymentResponse.paymentId,
          bookingReference: booking.bookingReference,
        },
      };
    } catch (e) {
      throw new InternalServerErrorException(
        e || 'An error occurred while initializing booking payment',
      );
    }
  }

  async confrimBooking(ctx: IConfirmBooking) {
    const { bookingId, paymentIntentId } = ctx;
    try {
      const bookingResult = await this.bookingProvider.findBooking({
        opts: 'id',
        id: bookingId,
      });

      if (!bookingResult || !bookingResult.data) {
        throw new NotFoundException('Booking not found');
      }

      const booking = bookingResult.data;

      await this.bookingProvider.updatePaymentDetails({
        bookingId,
        paymentIntentId,
        paidAt: new Date(),
      });

      await this.bookingProvider.updateBookingStatus({
        bookingId,
        status: 'confirmed',
        paymentStatus: 'paid',
      });

      const user = await this.userService.findUser(booking.doctorId);
      if (!user || !user.data) {
        throw new NotFoundException('User not found');
      }

      const videoRoom = await this.doxyService.createDoctorRoom({
        bookingId,
        doctorId: booking.doctorId,
        doctorName: user.data.fullName,
        patientId: booking.patientId,
      });

      await this.bookingProvider.updateVideoRoom({
        bookingId,
        videoRoomId: videoRoom.id,
        videoRoomUrl: videoRoom.url,
      });

      this.eventEmitter.emit(
        SharedEvents.BOOKING_CONFIRMED,
        new BookingConfirmedEvent(
          bookingId,
          booking.patientId,
          booking.doctorId,
          videoRoom.url,
        ),
      );

      return await this.bookingProvider.findBooking({
        opts: 'id',
        id: bookingId,
      });
    } catch (e) {
      throw new InternalServerErrorException(
        e || 'An error occurred while confirming booking',
      );
    }
  }

  async cancelBooking(ctx: ICancelBooking) {
    const { bookingId, uid, cancelledBy, reason } = ctx;
    try {
      const booking = await this.bookingProvider.findBooking({
        opts: bookingId ? 'id' : 'ext_id',
        id: bookingId ? bookingId : uid,
      });

      if (!booking || !booking.data) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.data.externalBookingId) {
        await this.calendarService.cancelBooking({
          bookingId: booking.data.externalBookingId,
          reason,
        });
      }

      await this.bookingProvider.cancelBooking({
        bookingId,
        cancelledBy,
        reason,
      });

      this.eventEmitter.emit(
        SharedEvents.BOOKING_CANCELLED,
        new BookingCancelledEvent(
          booking.data.id,
          booking.data.patientId,
          booking.data.doctorId,
          booking.data.paymentStatus,
          parseFloat(booking.data.amount),
        ),
      );

      return await this.bookingProvider.findBooking({
        opts: 'id',
        id: bookingId,
      });
    } catch (e) {
      throw new InternalServerErrorException(
        e || 'An error occurred while canceling booking',
      );
    }
  }

  async getBooking(bookingId: string) {
    const booking = await this.bookingProvider.findBooking({
      opts: 'id',
      id: bookingId,
    });

    if (!booking || !booking.data) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async getPatientBookings(ctx: IGetPatientBookings) {
    return await this.bookingProvider.getPatientBookings(ctx);
  }

  async getDoctorBookings(ctx: IGetDoctorBookings) {
    return await this.bookingProvider.getDoctorBookings(ctx);
  }

  async handlePaymentSuccess(ctx: IHandlePaymentSuccess) {
    const { txRef, id, amount, status, meta } = ctx;
    try {
      const booking = await this.bookingProvider.findBooking({
        opts: 'ref',
        refId: txRef,
      });

      if (!booking || !booking.data) {
        throw new NotFoundException('Booking not found');
      }

      if (status !== 'successful') {
        this.logger.warn(`Payment status is ${status}, not successful`);
        return;
      }

      if (parseFloat(String(amount)) !== parseFloat(booking.data.amount)) {
        this.logger.error(
          `Amount mismatch: expected ${booking.data.amount}, got ${amount}`,
        );
        return;
      }

      await this.bookingProvider.updatePaymentDetails({
        bookingId: booking.data.id,
        paymentIntentId: id.toString(),
        paidAt: new Date(),
      });

      await this.bookingProvider.updateBookingStatus({
        bookingId: booking.data.id,
        status: 'confirmed',
        paymentStatus: 'paid',
      });

      this.eventEmitter.emit(
        SharedEvents.BOOKING_CONFIRMED,
        new BookingConfirmedEvent(
          booking.data.id,
          booking.data.patientId,
          booking.data.doctorId,
          booking.data.videoRoomUrl!,
        ),
      );
    } catch (e) {
      throw new InternalServerErrorException(
        e || 'An error occurred while handling payment success',
      );
    }
  }

  async processBookingRefund(ctx: IProcessBookingRefund) {
    const { bookingId, reason } = ctx;
    try {
      const booking = await this.bookingProvider.findBooking({
        opts: 'id',
        id: bookingId,
      });

      if (!booking || !booking.data) {
        this.logger.error(`Booking not found`);
        throw new NotFoundException('Booking not found');
      }

      if (booking.data.paymentStatus !== 'paid') {
        throw new BadRequestException('Booking has not been paid');
      }

      if (!booking.data.paymentIntentId) {
        throw new BadRequestException('Payment intent ID not found');
      }

      const refundResponse = await this.flutterwaveService.processRefund({
        transactionId: booking.data.paymentIntentId,
      });

      await this.bookingProvider.updateBookingStatus({
        bookingId: booking.data.id,
        status: 'cancelled',
        paymentStatus: 'refunded',
      });

      this.logger.log(`Refund processed for booking ${bookingId}`);

      return {
        status: HttpStatus.OK,
        message: 'Refund processed successfully',
        data: {
          refundId: refundResponse.id,
          amount: refundResponse.amount,
          status: refundResponse.status,
        },
      };
    } catch (e) {
      this.logger.error(`Error processing booking refund: ${e.message}`);
      throw new InternalServerErrorException(
        e || 'An error occurred while processing booking refund',
      );
    }
  }

  async createVideoRoomForBooking(ctx: ICreateVideoRoomForBooking) {
    const { bookingId } = ctx;
    try {
      const videoRoom = await this.doxyService.createDoctorRoom(ctx);

      await this.bookingProvider.updateVideoRoom({
        bookingId,
        videoRoomId: videoRoom.id,
        videoRoomUrl: videoRoom.url,
      });

      return videoRoom;
    } catch (e) {
      this.logger.error(`Error creating video room for booking: ${e.message}`);
      throw new InternalServerErrorException(
        e || 'An error occurred while creating video room for booking',
      );
    }
  }

  async getVideoRoomUrl(bookingId: string) {
    try {
      const booking = await this.bookingProvider.findBooking({
        opts: 'id',
        id: bookingId,
      });

      if (!booking || !booking.data) {
        throw new NotFoundException('Booking not found');
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: 'Video room URL retrieved successfully',
        data: {
          videoRoomUrl: booking.data.videoRoomUrl,
        },
      });
    } catch (e) {
      this.logger.error(
        `Error getting video room URL for booking: ${e.message}`,
      );

      throw new InternalServerErrorException(
        e || 'An error occurred while getting video room URL for booking',
      );
    }
  }

  async isVideoRoomActive(bookingId: string) {
    try {
      const booking = await this.bookingProvider.findBooking({
        opts: 'id',
        id: bookingId,
      });

      if (!booking || !booking.data) {
        throw new NotFoundException('Booking not found');
      }

      const isVideoRoomActive =
        booking.data.status === 'confirmed' &&
        booking.data.paymentStatus === 'paid' &&
        !!booking.data.videoRoomUrl;

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: 'Video room status checked successfully',
        data: {
          isVideoRoomActive,
        },
      });
    } catch (e) {
      this.logger.error(`Error checking video room status: ${e.message}`);
      throw new InternalServerErrorException(
        e || 'An error occurred while checking video room status',
      );
    }
  }
}
