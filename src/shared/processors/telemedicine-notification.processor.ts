import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { DoctorService } from '@/modules/doctor/service/doctor.service';
import { BookingService } from '@/modules/booking/service/booking.service';
import { ResendService } from '../modules/resend/service/resend.service';

@Processor('telemedicine-notifications-queue')
export class TelemedicineNotificationProcessor {
  private readonly logger = new MyLoggerService(
    TelemedicineNotificationProcessor.name,
  );

  constructor(
    private readonly resendService: ResendService,
    private readonly bookingService: BookingService,
    private readonly doctorService: DoctorService,
  ) {}

  @Process('send-booking-created-email')
  async handleBookingCreatedEmail(job: Job) {
    try {
      const { bookingId, patientId } = job.data;
      this.logger.log(`Processing booking created email for ${bookingId}`);

      // TODO: Send initial "pending payment" email to patient
      // This will notify them that their slot is reserved pending payment

      this.logger.log('Booking created email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send booking created email', error);
      throw error;
    }
  }

  @Process('send-confirmation-email')
  async handleConfirmationEmail(job: Job) {
    try {
      const { bookingId, patientId, doctorId, type } = job.data;
      this.logger.log(`Processing confirmation email for booking ${bookingId}`);

      const booking = await this.bookingService.getBooking(bookingId);
      if (!booking || !booking.data) {
        this.logger.error(`Booking not found: ${bookingId}`);
        return;
      }

      const doctor = await this.doctorService.fetchDoctor(doctorId);

      if (!doctor || !doctor.data) {
        this.logger.warn(`Doctor not found: ${doctorId}, skipping reminder`);
        return;
      }

      if (type === 'patient_confirmation') {
        await this.resendService.sendBookingEmail({
          to: job.data.patientEmail || 'patient@example.com',
          patientName: job.data.patientName || 'Patient',
          doctorName: doctor.data.fullName,
          startTime: new Date(booking.data.startTime).toISOString(),
          endTime: new Date(booking.data.endTime).toISOString(),
          videoRoomUrl: booking.data.videoRoomUrl || '',
          bookingReference: booking.data.bookingReference,
          context: 'PATIENT_CONFIRMATION',
        });
      } else if (type === 'doctor_notification') {
        await this.resendService.sendBookingEmail({
          to: doctor.data.email,
          doctorName: doctor.data.fullName,
          patientName: job.data.patientName || 'Patient',
          startTime: new Date(booking.data.startTime).toISOString(),
          endTime: new Date(booking.data.endTime).toISOString(),
          videoRoomUrl: booking.data.videoRoomUrl || '',
          bookingReference: booking.data.bookingReference,
          context: 'DOCTOR_NOTIFICATION',
        });
      }

      this.logger.log('Confirmation email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send confirmation email', error);
      throw error;
    }
  }

  @Process('send-cancellation-email')
  async handleCancellationEmail(job: Job) {
    try {
      const {
        bookingId,
        refundAmount,
        patientEmail,
        patientName,
        doctorEmail,
        doctorName,
        type,
      } = job.data;
      this.logger.log(`Processing cancellation email for booking ${bookingId}`);

      const bookingResult = await this.bookingService.getBooking(bookingId);
      if (!bookingResult || !bookingResult.data) {
        this.logger.error(`Booking not found: ${bookingId}`);
        return;
      }

      const booking = bookingResult.data;

      // Determine recipient based on type
      if (type === 'patient_cancellation' && patientEmail) {
        await this.resendService.sendBookingEmail({
          to: patientEmail,
          patientName: patientName || 'Patient',
          bookingReference: booking.bookingReference,
          refundAmount,
          context: 'CANCELATION',
        });
      }

      if (type === 'doctor_cancellation' && doctorEmail) {
        await this.resendService.sendBookingEmail({
          to: doctorEmail,
          doctorName: doctorName || 'Doctor',
          bookingReference: booking.bookingReference,
          context: 'CANCELATION',
        });
      }

      this.logger.log('Cancellation email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send cancellation email', error);
      throw error;
    }
  }

  @Process('send-followup-survey')
  async handleFollowupSurvey(job: Job) {
    try {
      const { bookingId, patientId, patientEmail, patientName } = job.data;
      this.logger.log(`Processing follow-up survey for booking ${bookingId}`);

      // TODO: Send follow-up survey email
      // This could integrate with a survey tool like Typeform or Google Forms
      // For now, just log that we would send it

      this.logger.log('Follow-up survey email queued successfully');
    } catch (error) {
      this.logger.error('Failed to send follow-up survey', error);
      throw error;
    }
  }

  @Process('request-review')
  async handleReviewRequest(job: Job) {
    try {
      const { bookingId, patientId, doctorId, patientEmail, patientName } =
        job.data;
      this.logger.log(`Processing review request for booking ${bookingId}`);

      // TODO: Send review request email
      // This would ask patient to rate their experience with the doctor

      this.logger.log('Review request email queued successfully');
    } catch (error) {
      this.logger.error('Failed to send review request', error);
      throw error;
    }
  }
}
