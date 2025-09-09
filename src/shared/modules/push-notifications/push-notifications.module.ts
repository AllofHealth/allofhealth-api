import { Module } from '@nestjs/common';
import { PushNotificationsProvider } from './provider/push-notifications.provider';
import { PushNotificationsService } from './service/push-notifications.service';

@Module({
  providers: [PushNotificationsProvider, PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
