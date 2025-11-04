import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { DoctorService } from '@/modules/doctor/service/doctor.service';
import { BookingService } from '@/modules/booking/service/booking.service';
import { ResendService } from '../modules/resend/service/resend.service';

@Processor('telemedicine-reminders-queue')
export class TelemedicineReminderProcessor {
  private readonly logger = new MyLoggerService(
    TelemedicineReminderProcessor.name,
  );

  constructor(
    private readonly resendService: ResendService,
    private readonly bookingService: BookingService,
    private readonly doctorService: DoctorService,
  ) {}

  @Process('send-reminder')
  async handleReminder(job: Job) {
    try {
      const { bookingId, reminderType, patientId, doctorId } = job.data;

      this.logger.log(
        `Processing ${reminderType} reminder for booking ${bookingId}`,
      );

      const bookingResult = await this.bookingService.getBooking(bookingId);
      if (!bookingResult || !bookingResult.data) {
        this.logger.error(`Booking not found: ${bookingId}`);
        return;
      }

      const booking = bookingResult.data;

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

      await this.resendService.sendBookingEmail({
        to: patientEmail,
        patientName: patientName,
        reminderType: reminderType as '24h' | '1h',
        startTime: new Date(booking.startTime),
        videoRoomUrl: booking.videoRoomUrl || '',
        bookingReference: booking.bookingReference,
        context: 'REMINDER',
      });

      await this.resendService.sendBookingEmail({
        to: doctor.data.email,
        reminderType: reminderType as '24h' | '1h',
        doctorName: doctor.data.fullName,
        startTime: new Date(booking.startTime),
        videoRoomUrl: booking.videoRoomUrl || '',
        bookingReference: booking.bookingReference,
        context: 'REMINDER',
      });

      this.logger.log(`${reminderType} reminder sent successfully`);
    } catch (error) {
      this.logger.error('Failed to send reminder', error);
      throw error;
    }
  }
}
