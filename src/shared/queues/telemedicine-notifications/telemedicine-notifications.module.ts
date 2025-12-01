import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TelemedicineNotificationsQueue } from './telemedicine-notifications.queue';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'telemedicine-notifications-queue',
      },
      {
        name: 'telemedicine-reminders-queue',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'fixed',
            delay: 60000, // 1 minute
          },
        },
      },
    ),
  ],
  providers: [TelemedicineNotificationsQueue],
  exports: [TelemedicineNotificationsQueue],
})
export class TelemedicineNotificationsQueueModule {}
