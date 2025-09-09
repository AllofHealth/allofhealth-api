import { Injectable } from '@nestjs/common';
import { PushNotificationsProvider } from '../provider/push-notifications.provider';
import { ISendPushNotification } from '../interface/push-notifications.interface';

@Injectable()
export class PushNotificationsService {
  constructor(
    private readonly pushNotificationsProvider: PushNotificationsProvider,
  ) {}

  async sendPushNotification(ctx: ISendPushNotification) {
    return await this.pushNotificationsProvider.sendPushNotification(ctx);
  }
}
