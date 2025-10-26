import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NotificationService } from '../../modules/telemedicine/service/notification.service';
import { BookingProvider } from '../../modules/telemedicine/provider/booking.provider';
import { DoctorProvider } from '../../modules/telemedicine/provider/doctor.provider';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@Processor('telemedicine-reminders-queue')
export class TelemedicineReminderProcessor {
  private readonly logger = new MyLoggerService(
    TelemedicineReminderProcessor.name,
  );

  constructor(
    private readonly notificationService: NotificationService,
    private readonly bookingProvider: BookingProvider,
    private readonly doctorProvider: DoctorProvider,
  ) {}

  @Process('send-reminder')
  async handleReminder(job: Job) {
    try {
      const { bookingId, reminderType, patientId, doctorId } = job.data;

      this.logger.log(
        `Processing ${reminderType} reminder for booking ${bookingId}`,
      );

      // Get booking to verify it's still active
      const booking = await this.bookingProvider.findBookingById(bookingId);

      if (!booking) {
        this.logger.warn(`Booking not found: ${bookingId}, skipping reminder`);
        return;
      }

      // Don't send reminder if booking is cancelled
      if (booking.status === 'cancelled') {
        this.logger.log(`Booking ${bookingId} is cancelled, skipping reminder`);
        return;
      }

      // Get doctor details
      const doctor = await this.doctorProvider.getDoctorWithUser(doctorId);
      if (!doctor || !doctor.user) {
        this.logger.error(`Doctor not found: ${doctorId}`);
        return;
      }

      console.log(
        'job object to confirm that the patience email exist for remider (from line 22 of reminder-processor.ts in telemedicine',
        job.data,
      );
      // Send reminder to patient (assuming we have patient email from user table)
      // You'll need to fetch patient email from user table
      const patientEmail =
        job.data.patientEmail || 'patient@allofhealth.africa';
      const patientName = job.data.patientName || 'Patient';

      await this.notificationService.sendReminderEmail({
        email: patientEmail,
        name: patientName,
        reminderType: reminderType as '24h' | '1h',
        startTime: new Date(booking.startTime),
        videoRoomUrl: booking.videoRoomUrl || '',
        bookingReference: booking.bookingReference,
      });

      // Send reminder to doctor
      await this.notificationService.sendReminderEmail({
        email: doctor.user.emailAddress,
        name: doctor.user.fullName,
        reminderType: reminderType as '24h' | '1h',
        startTime: new Date(booking.startTime),
        videoRoomUrl: booking.videoRoomUrl || '',
        bookingReference: booking.bookingReference,
      });

      this.logger.log(`${reminderType} reminder sent successfully`);
    } catch (error) {
      this.logger.error('Failed to send reminder', error);
      throw error;
    }
  }
}
