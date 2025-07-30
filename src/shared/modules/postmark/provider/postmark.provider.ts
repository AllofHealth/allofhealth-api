import { PostmarkConfig } from '@/shared/config/postmark/postmark.config';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ServerClient } from 'postmark';
import { ISendEmail } from '../interface/postmark.interface';
import {
  EMAIL_CONFIG,
  POSTMARK_ERROR_MESSAGES as PEM,
  POSTMAN_SUCCESS_MESSAGES as PSM,
} from '../data/postmark.data';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@Injectable()
export class PostmarkProvider {
  private readonly logger = new MyLoggerService(PostmarkProvider.name);
  constructor(
    private readonly postmarkConfig: PostmarkConfig,
    private readonly handler: ErrorHandler,
  ) {}

  private provideClient() {
    return new ServerClient(this.postmarkConfig.SERVER_TOKEN);
  }

  async sendEmail(ctx: ISendEmail) {
    const { to, body } = ctx;
    try {
      const client = this.provideClient();
      const result = await client.sendEmail({
        From: EMAIL_CONFIG.FROM,
        To: to,
        Subject: EMAIL_CONFIG.SUBJECT,
        TextBody: body,
      });

      if (!result.MessageID) {
        this.logger.debug(
          `Failed to send email, please check the postmark server`,
        );
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: PEM.ERROR_SENDING_EMAIL,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: PSM.SUCCESS_SENDING_EMAIL,
        data: {
          id: result.MessageID,
          timestamp: result.SubmittedAt,
        },
      });
    } catch (e) {
      return this.handler.handleError(e, PEM.ERROR_SENDING_EMAIL);
    }
  }

  // todo: implement templated mails
}
