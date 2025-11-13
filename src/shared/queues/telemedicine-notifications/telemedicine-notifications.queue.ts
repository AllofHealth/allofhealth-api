import {
  ISendCancelationEmail,
  ISendConfirmationEmail,
  ISendRequestReview,
  ISendSurveyEmail,
  ISendTelemedicineReminder,
} from '@/modules/telemedicine/interface/telemedicine.interface';
import { IHandleBookingRequest } from '@/shared/modules/resend/interface/resend.interface';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export class TelemedicineNotificationsQueue {
  constructor(
    @InjectQueue('telemedicine-notifications-queue')
    private readonly telemedicineNotificationsQueue: Queue,
    @InjectQueue('telemedicine-reminders-queue')
    private readonly telemedicineRemindersQueue: Queue,
  ) {}

  async handleBookingCreationJob(data: IHandleBookingRequest) {
    await this.telemedicineNotificationsQueue.add(
      'send-booking-created-email',
      data,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async handleSendConfirmationEmailJob(data: ISendConfirmationEmail) {
    await this.telemedicineNotificationsQueue.add(
      'send-confirmation-email',
      data,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async handleSendCancelationEmailJob(data: ISendCancelationEmail) {
    await this.telemedicineNotificationsQueue.add(
      'send-cancelation-email',
      data,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async handleSendFollowupSurveyJob(data: ISendSurveyEmail) {
    await this.telemedicineNotificationsQueue.add(
      'send-followup-survey',
      data,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async handleRequestReviewJob(data: ISendRequestReview) {
    await this.telemedicineNotificationsQueue.add('request-review', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async handleSendReminderJob(data: ISendTelemedicineReminder) {
    await this.telemedicineRemindersQueue.add('send-reminder', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: data.delay,
      },
    });
  }

  async getDelayedReminderJobs() {
    return await this.telemedicineRemindersQueue.getJobs(['delayed']);
  }

  async getDelayedReminderJobsByBookingId(bookingId: string) {
    const delayedJobs = await this.telemedicineRemindersQueue.getJobs([
      'delayed',
    ]);
    return delayedJobs.filter((job) => job.data.bookingId === bookingId);
  }

  async removeDelayedReminderJob(jobId: string) {
    await this.telemedicineRemindersQueue.removeJobs(jobId);
  }
}
