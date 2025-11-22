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

  @Process('send-batch-reminders')
  async handleBatchReminders(job: Job<IHandleSendReminderEmail[]>) {
    const reminders = job.data;
    this.logger.log(`Processing batch of ${reminders.length} reminder emails`);

    const results = await Promise.allSettled(
      reminders.map(async (reminder) => {
        try {
          await this.resendService.sendBookingEmail({
            to: reminder.to,
            patientName: reminder.patientName,
            doctorName: reminder.doctorName,
            consultationType: reminder.consultationType,
            date: reminder.date,
            time: reminder.time,
            context: 'REMINDER',
          });
          this.logger.log(`Reminder sent successfully to ${reminder.to}`);
          return { to: reminder.to, status: 'fulfilled' };
        } catch (error) {
          this.logger.error(`Failed to send reminder to ${reminder.to}`, error);
          return { to: reminder.to, status: 'rejected', error };
        }
      }),
    );

    return results;
  }

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
