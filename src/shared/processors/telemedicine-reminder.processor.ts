import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NotificationService } from '../../modules/telemedicine/service/notification.service';
import { BookingProvider } from '../../modules/telemedicine/provider/booking.provider';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { DoctorService } from '@/modules/doctor/service/doctor.service';

@Processor('telemedicine-reminders-queue')
export class TelemedicineReminderProcessor {
  private readonly logger = new MyLoggerService(
    TelemedicineReminderProcessor.name,
  );

  constructor(
    private readonly notificationService: NotificationService,
    private readonly bookingProvider: BookingProvider,
    private readonly doctorService: DoctorService,
  ) {}

  @Process('send-reminder')
  async handleReminder(job: Job) {
    try {
      const { bookingId, reminderType, patientId, doctorId } = job.data;

      this.logger.log(
        `Processing ${reminderType} reminder for booking ${bookingId}`,
      );

      const booking = await this.bookingProvider.findBookingById(bookingId);

      if (!booking) {
        this.logger.warn(`Booking not found: ${bookingId}, skipping reminder`);
        return;
      }

      if (booking.status === 'cancelled') {
        this.logger.log(`Booking ${bookingId} is cancelled, skipping reminder`);
        return;
      }

      const doctor = await this.doctorService.fetchDoctor(doctorId);

      if (!doctor || !doctor.data) {
        this.logger.warn(`Doctor not found: ${doctorId}, skipping reminder`);
        return;
      }

      console.log(
        'job object to confirm that the patience email exist for remider (from line 22 of reminder-processor.ts in telemedicine',
        job.data,
      );

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

      await this.notificationService.sendReminderEmail({
        email: doctor.data.email,
        reminderType: reminderType as '24h' | '1h',
        name: doctor.data.fullName,
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
