import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ResendConfig } from '@/shared/config/resend/resend.config';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { CreateEmailResponse, Resend } from 'resend';
import {
  IHandleBooking,
  IHandleOnboarding,
  IHandleOtp,
  ISendEmail,
} from '../interface/resend.interface';
import {
  RESEND_ERROR_MESSAGE as REM,
  RESEND_EMAIL_CONFIG as REC,
  RESEND_SUCCESS_MESSAGE as RSM,
} from '../data/resend.data';
import OnboardingEmail from '@/shared/templates/welcome.template';
import VerificationEmail from '@/shared/templates/otp.template';

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

  private handleOnboardingTemplate(ctx: IHandleOnboarding) {
    const {
      name,
      from = REC.ONBOARDING_FROM,
      to,
      subject = REC.ONBOARDING_SUBJECT,
    } = ctx;
    return {
      from: from,
      to: to,
      subject: subject,
      react: OnboardingEmail({
        name: name,
        loginUrl: REC.ONBOARDING_LOGIN_URL,
      }),
    };
  }

  private handleOtpTemplate(ctx: IHandleOtp) {
    const { from = REC.FROM, to, subject = REC.SUBJECT, name, code } = ctx;
    return {
      from: from,
      to: to,
      subject: subject,
      react: VerificationEmail({
        name: name,
        code: code,
      }),
    };
  }

  private handleBookingEmailTemplate(ctx: IHandleBooking) {
    const { context } = ctx;
    switch (context) {
      case 'PATIENT_CONFIRMATION':
        break;
      case 'DOCTOR_NOTIFICATION':
        break;
      case 'REMINDER':
        break;
      case 'CANCELATION':
        break;
    }
  }

  async sendEmail(ctx: ISendEmail) {
    const { to, body, context, name } = ctx;
    try {
      const resend = this.initResend();
      let response: CreateEmailResponse | null = null;

      switch (context) {
        case 'WELCOME':
          const onboardingConfig = this.handleOnboardingTemplate({
            to,
            name: name!,
          });
          response = await resend.emails.send({
            from: onboardingConfig.from,
            to: to,
            subject: onboardingConfig.subject,
            react: onboardingConfig.react,
          });
          break;
        case 'OTP':
          const otpConfig = this.handleOtpTemplate({
            to: to,
            name: name!,
            code: body!,
          });
          response = await resend.emails.send({
            from: otpConfig.from,
            to: to,
            subject: otpConfig.subject,
            react: otpConfig.react,
          });
          break;
        default:
          throw new NotImplementedException();
      }

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
