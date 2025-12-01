import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ResendService } from '../modules/resend/service/resend.service';
import { IHandleSendReminderEmail } from '../modules/resend/interface/resend.interface';

@Processor('telemedicine-reminders-queue')
export class TelemedicineReminderProcessor {
  private readonly logger = new MyLoggerService(
    TelemedicineReminderProcessor.name,
  );

  constructor(private readonly resendService: ResendService) {}

  @Process('send-reminder')
  async handleReminder(job: Job<IHandleSendReminderEmail>) {
    this.logger.log(`sending reminder email to ${job.data.to}`);
    try {
      await this.resendService.sendBookingEmail({
        to: job.data.to,
        patientName: job.data.patientName,
        doctorName: job.data.doctorName,
        consultationType: job.data.consultationType,
        date: job.data.date,
        time: job.data.time,
        context: 'REMINDER',
      });

      this.logger.log(`reminder sent successfully`);
    } catch (error) {
      this.logger.error('Failed to send reminder', error);
      throw error;
    }
  }
}
