import { Module } from '@nestjs/common';
import { PushNotificationsService } from './service/push-notifications.service';
import { PushNotificationsProvider } from './provider/push-notifications.provider';

@Module({
  providers: [PushNotificationsProvider, PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
