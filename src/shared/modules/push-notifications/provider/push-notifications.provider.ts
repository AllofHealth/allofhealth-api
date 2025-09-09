import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../config/allofhealth-google.config.json';
import { ISendPushNotification } from '../interface/push-notifications.interface';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { PUSH_NOTIFICATIONS_ERROR_MESSAGES } from '../data/push-notifications.data';
import { PushNotificationsError } from '../error/push-notifications.error';

@Injectable()
export class PushNotificationsProvider {
  private readonly logger = new MyLoggerService(PushNotificationsProvider.name);
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
    }
  }

  async sendPushNotification(ctx: ISendPushNotification) {
    const { token, title, body, data } = ctx;
    try {
      const message = {
        notification: { title, body },
        data,
        token,
      };

      return await admin.messaging().send(message);
    } catch (e) {
      this.logger.error(
        `${PUSH_NOTIFICATIONS_ERROR_MESSAGES.ERROR_SENDING_NOTIFICATION}, ${e}`,
      );
      throw new PushNotificationsError(
        PUSH_NOTIFICATIONS_ERROR_MESSAGES.ERROR_SENDING_NOTIFICATION,
        { cause: e },
      );
    }
  }
}
