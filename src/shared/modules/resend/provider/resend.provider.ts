import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ResendConfig } from '@/shared/config/resend/resend.config';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ISendEmail } from '../interface/resend.interface';
import {
  RESEND_ERROR_MESSAGE as REM,
  RESEND_EMAIL_CONFIG as REC,
  RESEND_SUCCESS_MESSAGE as RSM,
} from '../data/resend.data';

@Injectable()
export class ResendProvider {
  private readonly logger = new MyLoggerService(ResendProvider.name);
  constructor(
    private readonly handler: ErrorHandler,
    private readonly config: ResendConfig,
  ) {}

  initResend() {
    return new Resend(this.config.RESEND_API_KEY);
  }

  /**
   * @todo Handle email templates
   * @param ctx
   * @returns
   */

  async sendEmail(ctx: ISendEmail) {
    const {
      from = REC.FROM,
      to,
      body,
      subject = REC.SUBJECT,
      useHtml = false,
    } = ctx;
    try {
      const resend = this.initResend();
      const response = await resend.emails.send({
        from: from,
        to: to,
        subject: subject,
        text: body,
      });

      if (!response || !response.data || !response.data.id) {
        this.logger.error('Failed to send email');
        throw new Error(REM.EMAIL_NOT_SENT);
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.EMAIL_SENT,
        data: response.data.id,
      });
    } catch (e) {
      return this.handler.handleError(e, REM.ERROR_SENDING_EMAIL);
    }
  }
}
