import { BookingService } from '@/modules/booking/service/booking.service';
import { IGetDoctorConsultationTypes } from '@/modules/consultation/interface/consultation.interface';
import { ConsultationService } from '@/modules/consultation/service/consultation.service';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import {
  BookingCancelledEvent,
  BookingCompletedEvent,
  BookingConfirmedEvent,
  BookingCreatedEvent,
} from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { CalendarService } from '@/shared/modules/calender/service/calendar.service';
import { FlutterwaveService } from '@/shared/modules/flutterwave/service/flutterwave.service';
import { TelemedicineNotificationsQueue } from '@/shared/queues/telemedicine-notifications/telemedicine-notifications.queue';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ICheckSlotAvailability,
  IGetCalComEmbedConfig,
  IGetDoctorAvailability,
  ILogAuditTrail,
} from '../interface/telemedicine.interface';

@Injectable()
export class TelemedicineService {
  private readonly logger = new MyLoggerService(TelemedicineService.name);
  constructor(
    private readonly handler: ErrorHandler,
    private readonly telemedicineNotificationsQueue: TelemedicineNotificationsQueue,
    private readonly bookingService: BookingService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly consultationService: ConsultationService,
    private readonly calendarService: CalendarService,
  ) {}

  private async logAuditTrail(data: ILogAuditTrail) {
    try {
      this.logger.log(
        `Audit: ${data.action} for booking ${data.bookingId} ${{
          ...data,
          timestamp: new Date().toISOString(),
        }}`,
      );

      // TODO: Insert into booking_audit_logs table
      // await this.auditLogProvider.create({
      //   bookingId: data.bookingId,
      //   action: data.action,
      //   actorId: data.actorId,
      //   actorType: data.actorType,
      //   previousStatus: data.previousStatus,
      //   newStatus: data.newStatus,
      //   changes: data.changes,
      // });
    } catch (error) {
      this.logger.error('Failed to log audit trail', error);
    }
  }

  @OnEvent(SharedEvents.BOOKING_CREATED)
  async handleBookingCreated(event: BookingCreatedEvent) {
    try {
      this.logger.log(`Booking created: ${event.bookingId}`);

      await this.telemedicineNotificationsQueue.handleBookingCreationJob({
        bookingId: event.bookingId,
        patientId: event.patientId,
        type: 'booking_created',
      });

      await this.logAuditTrail({
        bookingId: event.bookingId,
        action: 'booking_created',
        actorId: event.patientId,
        actorType: 'patient',
        newStatus: 'pending_payment',
        changes: {
          amount: event.amount,
          status: 'pending_payment',
        },
      });

      this.logger.log('Booking created event processed successfully');
    } catch (error) {
      this.logger.error('Failed to handle booking created event', error);
    }
  }

  @OnEvent(SharedEvents.BOOKING_CONFIRMED)
  async handleBookingConfirmed(event: BookingConfirmedEvent) {
    try {
      this.logger.log(`Booking confirmed: ${event.bookingId}`);

      const bookingResult = await this.bookingService.getBooking(
        event.bookingId,
      );
      if (!bookingResult || !bookingResult.data) {
        this.logger.error(`Booking not found: ${event.bookingId}`);
        return;
      }

      const booking = bookingResult.data;

      await this.telemedicineNotificationsQueue.handleSendConfirmationEmailJob({
        bookingId: event.bookingId,
        patientId: event.patientId,
        doctorId: event.doctorId,
        videoRoomUrl: event.videoRoomUrl,
        startTime: booking.startTime,
        endTime: booking.endTime,
        type: 'patient_confirmation',
      });

      await this.telemedicineNotificationsQueue.handleSendConfirmationEmailJob({
        bookingId: event.bookingId,
        patientId: event.patientId,
        doctorId: event.doctorId,
        videoRoomUrl: event.videoRoomUrl,
        startTime: booking.startTime,
        endTime: booking.endTime,
        type: 'doctor_confirmation',
      });

      const startTime = new Date(booking.startTime);

      const reminder24h = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > new Date()) {
        await this.telemedicineNotificationsQueue.handleSendReminderJob({
          bookingId: event.bookingId,
          patientId: event.patientId,
          doctorId: event.doctorId,
          reminderType: '24h',
          videoRoomUrl: event.videoRoomUrl,
          delay: reminder24h.getTime() - Date.now(),
        });
      }

      const reminder1h = new Date(startTime.getTime() - 60 * 60 * 1000);
      if (reminder1h > new Date()) {
        await this.telemedicineNotificationsQueue.handleSendReminderJob({
          bookingId: event.bookingId,
          patientId: event.patientId,
          doctorId: event.doctorId,
          reminderType: '1h',
          videoRoomUrl: event.videoRoomUrl,
          delay: reminder24h.getTime() - Date.now(),
        });
      }

      await this.logAuditTrail({
        bookingId: event.bookingId,
        action: 'booking_confirmed',
        actorId: 'system',
        actorType: 'system',
        previousStatus: 'processing_payment',
        newStatus: 'confirmed',
        changes: {
          paymentStatus: 'paid',
          videoRoomUrl: event.videoRoomUrl,
        },
      });

      this.logger.log('Booking confirmed event processed successfully');
    } catch (error) {
      this.logger.error('Failed to handle booking confirmed event', error);
    }
  }

  @OnEvent(SharedEvents.BOOKING_CANCELLED)
  async handleBookingCancelled(event: BookingCancelledEvent) {
    try {
      this.logger.log(`Booking cancelled: ${event.bookingId}`);

      const bookingResult = await this.bookingService.getBooking(
        event.bookingId,
      );
      if (!bookingResult || !bookingResult.data) {
        this.logger.error(`Booking not found: ${event.bookingId}`);
        return;
      }
      const booking = bookingResult.data;

      if (event.paymentStatus === 'paid') {
        try {
          await this.flutterwaveService.processRefund({
            transactionId: event.bookingId,
          });
          this.logger.log(`Refund processed for booking ${event.bookingId}`);
        } catch (refundError) {
          this.logger.error('Refund processing failed', refundError);
        }
      }

      await this.telemedicineNotificationsQueue.handleSendCancelationEmailJob({
        bookingId: event.bookingId,
        patientId: event.patientId,
        doctorId: event.doctorId,
        refundAmount: event.paymentStatus === 'paid' ? event.amount : 0,
        type: 'patient_cancellation',
      });

      await this.telemedicineNotificationsQueue.handleSendCancelationEmailJob({
        bookingId: event.bookingId,
        patientId: event.patientId,
        doctorId: event.doctorId,
        type: 'doctor_cancellation',
      });

      const jobs =
        await this.telemedicineNotificationsQueue.getDelayedReminderJobs();
      for (const job of jobs) {
        if (job.data.bookingId === event.bookingId) {
          job.remove();
        }
      }

      await this.logAuditTrail({
        bookingId: event.bookingId,
        action: 'booking_cancelled',
        actorId: booking.cancelledBy || 'system',
        actorType: 'user',
        previousStatus: booking.status,
        newStatus: 'cancelled',
        changes: {
          cancellationReason: booking.cancellationReason,
          refundStatus:
            event.paymentStatus === 'paid' ? 'refunded' : 'no_refund',
        },
      });

      this.logger.log('Booking cancelled event processed successfully');
    } catch (error) {
      this.logger.error('Failed to handle booking cancelled event', error);
    }
  }

  @OnEvent(SharedEvents.BOOKING_COMPLETED)
  async handleBookingCompleted(event: BookingCompletedEvent) {
    try {
      this.logger.log(`Booking completed: ${event.bookingId}`);

      const bookingResult = await this.bookingService.getBooking(
        event.bookingId,
      );
      if (!bookingResult || !bookingResult.data) {
        this.logger.error(`Booking not found: ${event.bookingId}`);
        return;
      }

      const booking = bookingResult.data;

      await this.telemedicineNotificationsQueue.handleSendFollowupSurveyJob({
        bookingId: event.bookingId,
        patientId: event.patientId,
        doctorId: event.doctorId,
      });

      await this.telemedicineNotificationsQueue.handleRequestReviewJob({
        bookingId: event.bookingId,
        patientId: event.patientId,
        doctorId: event.doctorId,
      });

      // 3. Trigger payout to doctor (Flutterwave transfer)
      // This will be handled by a separate payout service
      // await this.payoutService.initiatePayoutToDoctor(event.doctorId, event.bookingId);

      // 4. Archive video recording (if enabled)
      // This depends on Doxy.me plan and configuration
      // await this.videoRoomService.archiveRecording(event.bookingId);

      // 5. Update consultation history (analytics)
      // await this.analyticsService.recordCompletedConsultation({
      //   bookingId: event.bookingId,
      //   doctorId: event.doctorId,
      //   patientId: event.patientId,
      //   duration: event.duration,
      // });

      // 6. Award tokens/rewards if applicable
      // This integrates with your existing reward system
      // await this.rewardService.awardConsultationToken(event.patientId);

      await this.logAuditTrail({
        bookingId: event.bookingId,
        action: 'booking_completed',
        actorId: 'system',
        actorType: 'system',
        previousStatus: 'confirmed',
        newStatus: 'completed',
        changes: {
          duration: event.duration,
          completedAt: new Date(),
        },
      });

      this.logger.log('Booking completed event processed successfully');
    } catch (error) {
      this.logger.error('Failed to handle booking completed event', error);
    }
  }

  async getDoctorAvailability(ctx: IGetDoctorAvailability) {
    const { consultationTypeId, doctorId, endDate, startDate } = ctx;
    try {
      const consultationType =
        await this.consultationService.findById(consultationTypeId);

      if (!consultationType || !consultationType.data) {
        throw new NotFoundException('Consultation type not found');
      }

      const consultationData = consultationType.data.doctor_consultation_types

      if (!consultationData.calcomEventTypeId) {
        throw new BadRequestException(
          'Consultation type not linked to Cal.com event',
        );
      }

      const availability = await this.calendarService.getAvailability({
        eventTypeId: consultationData.calcomEventTypeId,
        startDate,
        endDate,
        lengthInMinutes: consultationData.durationMinutes,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: 'Doctor availability retrieved successfully',
        data: {
          consultationType: {
            id: consultationData.id,
            name: consultationType.data.consultation_type.name,
            duration: consultationData.durationMinutes,
            price: parseFloat(consultationData.price),
            currency: consultationData.currency,
          },
          slots: availability.slots.map(
            (slot: { start: string; end: string; available: boolean }) => ({
              start: slot.start,
              end: slot.end,
              available: slot.available,
            }),
          ),
        },
      });
    } catch (e) {
      this.logger.error('Failed to get doctor availability', e);
      throw new InternalServerErrorException(
        e.message || 'Failed to get doctor availability',
      );
    }
  }

  async getDoctorConsultationTypes(ctx: IGetDoctorConsultationTypes) {
    return await this.consultationService.getDoctorConsultationTypes(ctx);
  }

  async checkSlotAvailability(ctx: ICheckSlotAvailability) {
    const { consultationTypeId, doctorId, startTime } = ctx;

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    try {
      const doctorAvailability = await this.getDoctorAvailability({
        consultationTypeId,
        doctorId,
        startDate: startTime,
        endDate: endTime,
      });

      if (!doctorAvailability.data) {
        throw new NotFoundException('Doctor availability not found');
      }

      return doctorAvailability.data.slots.some(
        (slot) =>
          slot.available &&
          new Date(slot.start).getTime() === startTime.getTime(),
      );
    } catch (e) {
      this.logger.error('Failed to check slot availability', e);
      throw new InternalServerErrorException(
        e.message || 'Failed to check slot availability',
      );
    }
  }

  async getCalComEmbedConfig(ctx: IGetCalComEmbedConfig) {
    const { consultationTypeId } = ctx;
    try {
      const consultationType =
        await this.consultationService.findById(consultationTypeId);

      if (!consultationType || !consultationType.data) {
        throw new NotFoundException('Consultation type not found');
      }
      const consultationData = consultationType.data.doctor_consultation_types

      if (!consultationData.calcomEventTypeId) {
        throw new BadRequestException(
          'Consultation type not configured for bookings',
        );
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: 'Cal.com embed config retrieved successfully',
        data: {
          eventTypeId: consultationData.calcomEventTypeId,
          consultationType: {
            id: consultationData.id,
            name: consultationType.data.consultation_type.name,
            description: consultationData.description,
            duration: consultationData.durationMinutes,
            price: parseFloat(consultationData.price),
            currency: consultationData.currency,
          },
          embedConfig: {
            theme: 'light',
            hideEventTypeDetails: false,
            layout: 'month_view',
          },
        },
      });
    } catch (e) {
      this.logger.error('Failed to get Cal.com embed config', e);
      throw new InternalServerErrorException(
        e.message || 'Failed to get Cal.com embed config',
      );
    }
  }
}
