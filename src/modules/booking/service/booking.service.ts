import {
  BadRequestException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BookingProvider } from '../provider/booking.provider';
import {
  ICancelBooking,
  IConfirmBooking,
  ICreateVideoRoomForBooking,
  IFetchAllBookings,
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
import {
  formatDateToReadable,
  formatTimeReadable,
} from '@/shared/utils/date.utils';
import { BOOKING_DURATION } from '../data/booking.data';

@Injectable()
export class BookingService {
  private readonly logger = new MyLoggerService(BookingService.name);
  constructor(
    private readonly handler: ErrorHandler,
    private readonly bookingProvider: BookingProvider,
    private readonly consultationService: ConsultationService,
    private readonly calendarService: CalendarService,
    private readonly flutterwaveService: FlutterwaveService,
    @Inject(forwardRef(() => UserService))
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
          `Consultation type not found for event type ${metadata.consultationId}`,
        );
      }
      const consultationData = consultationType.data.doctor_consultation_types;

      const patientId = metadata.patientId;
      const doctorId = consultationData.doctorId;

      if (!patientId) {
        throw new BadRequestException(
          'Patient ID not found in booking metadata',
        );
      }

      const [patientData, doctorData] = await Promise.all([
        this.userService.findUser(patientId),
        this.userService.findUser(doctorId),
      ]);

      if (
        !patientData ||
        !doctorData ||
        !patientData.data ||
        !doctorData.data
      ) {
        throw new NotFoundException('Patient or Doctor data not found');
      }

      await this.consultationService.updateDoctorConsultationType({
        id: consultationData.id,
        data: {
          eventTypeId,
        },
      });

      const bookingReference = this.bookingProvider.generateBookingReference();

      const booking = await this.bookingProvider.createBooking({
        bookingReference,
        patientId,
        doctorId,
        consultationId: consultationData.id,
        consultationDate: new Date(startTime),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        timezone: attendees[0]?.timeZone || 'UTC',
        amount: parseFloat(consultationData.price),
        currency: consultationData.currency,
        externalBookingId: uid,
        externalBookingUrl: `https://cal.com/booking/${uid}`,
        metadata: metadata,
      });

      if (!booking || !booking.data) {
        throw new BookingError(
          booking?.message || 'An error occurred while creating booking',
        );
      }

      const patient = patientData.data;
      const doctor = doctorData.data;
      const date = new Date(Date.now());
      const time = date.getTime();

      this.eventEmitter.emit(
        SharedEvents.BOOKING_CREATED,
        new BookingCreatedEvent(
          patient.email,
          patient.fullName,
          doctor.fullName,
          formatDateToReadable(date),
          formatTimeReadable(time),
          consultationData.consultationType,
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
    const { txRef, id, amount, status } = ctx;
    try {
      const bookingResult = await this.bookingProvider.findBooking({
        opts: 'ref',
        refId: txRef,
      });

      if (!bookingResult || !bookingResult.data) {
        throw new NotFoundException(
          `Booking with reference ${txRef} not found`,
        );
      }

      const booking = bookingResult.data;

      if (booking.paymentStatus === 'paid') {
        this.logger.log(
          `Payment for booking ${booking.id} has already been processed.`,
        );
        return;
      }

      if (status !== 'successful') {
        this.logger.warn(
          `Payment for booking ${booking.id} was not successful. Status: ${status}`,
        );
        await this.bookingProvider.updateBookingStatus({
          bookingId: booking.id,
          status: 'payment_failed',
          paymentStatus: 'failed',
        });
        return;
      }

      if (parseFloat(String(amount)) < parseFloat(booking.amount)) {
        this.logger.error(
          `Amount mismatch for booking ${booking.id}: expected at least ${booking.amount}, got ${amount}`,
        );
        await this.bookingProvider.updateBookingStatus({
          bookingId: booking.id,
          status: 'payment_failed',
          paymentStatus: 'failed',
        });

        throw new BadRequestException(
          `Amount mismatch for booking ${booking.id}`,
        );
      }

      const [patientResult, doctorResult] = await Promise.all([
        this.userService.findUser(booking.patientId),
        this.userService.findUser(booking.doctorId),
      ]);

      if (
        !patientResult ||
        !doctorResult ||
        !patientResult.data ||
        !doctorResult.data
      ) {
        throw new NotFoundException(
          'Patient or Doctor data not found for booking',
        );
      }

      const patientData = patientResult.data;
      const doctorData = doctorResult.data;

      const videoRoom = await this.doxyService.createDoctorRoom({
        bookingId: booking.id,
        doctorId: booking.doctorId,
        doctorName: doctorData.fullName,
        patientId: booking.patientId,
      });

      await this.bookingProvider.updateVideoRoom({
        bookingId: booking.id,
        videoRoomId: videoRoom.id,
        videoRoomUrl: videoRoom.url,
      });

      await this.bookingProvider.updateBookingStatus({
        bookingId: booking.id,
        status: 'confirmed',
        paymentStatus: 'paid',
      });

      await this.bookingProvider.updatePaymentDetails({
        bookingId: booking.id,
        paymentIntentId: id.toString(),
        paidAt: new Date(),
      });

      const consultationType = await this.consultationService.findById(
        booking.consultationId,
      );

      if (!consultationType || !consultationType.data) {
        throw new NotFoundException(
          `Consultation type not found for booking ${booking.id}`,
        );
      }
      const consultationData = consultationType.data.doctor_consultation_types;

      this.eventEmitter.emit(
        SharedEvents.BOOKING_CONFIRMED,
        new BookingConfirmedEvent(
          patientData.email,
          booking.bookingReference,
          undefined,
          doctorData.fullName,
          undefined,
          patientData.fullName,
          new Date().toISOString(),
          booking.startTime.toISOString(),
          booking.endTime.toISOString(),
          consultationData.consultationType,
          '',
          videoRoom.url,
          'PATIENT_CONFIRMATION',
        ),
      );
    } catch (e) {
      this.logger.error(
        `Failed to handle payment success for txRef ${txRef}: ${e.message}`,
        e.stack,
      );
      if (e instanceof BadRequestException || e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(
        e.message || 'An error occurred while handling payment success',
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

  async fetchAllBookings(ctx: IFetchAllBookings) {
    return await this.bookingProvider.fetchAllBookings(ctx);
  }
}
