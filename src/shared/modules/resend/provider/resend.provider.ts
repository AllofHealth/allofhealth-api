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
  IHandleBookingRequest,
  IHandleOnboarding,
  IHandleOtp,
  IHandlePatientConfirmationEmail,
  IHandleSendReminderEmail,
  ISendEmail,
} from '../interface/resend.interface';
import {
  RESEND_ERROR_MESSAGE as REM,
  RESEND_EMAIL_CONFIG as REC,
  RESEND_SUCCESS_MESSAGE as RSM,
  BOOKING_REQUEST_EMAIL_CONFIG,
  PAYMENT_CONFIRMED_CONFIG,
} from '../data/resend.data';
import OnboardingEmail from '@/shared/templates/welcome.template';
import VerificationEmail from '@/shared/templates/otp.template';
import BookingRequestEmail from '@/shared/templates/booking-request.template';
import PaymentConfirmationEmail from '@/shared/templates/payment-confirmation.template';
import PaymentReminderEmail from '@/shared/templates/payment-reminder.template';
import { IcsService } from '../../ics/service/ics.service';
import {
  formatDateToReadable,
  formatTimeReadable,
} from '@/shared/utils/date.utils';

@Injectable()
export class ResendProvider {
  private readonly logger = new MyLoggerService(ResendProvider.name);
  constructor(
    private readonly handler: ErrorHandler,
    private readonly config: ResendConfig,
    private readonly icsService: IcsService,
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

  private handleBookingRequestReceivedTemplate(ctx: IHandleBookingRequest) {
    const {
      from = BOOKING_REQUEST_EMAIL_CONFIG.FROM,
      to,
      subject = BOOKING_REQUEST_EMAIL_CONFIG.SUBJECT,
      consultationType,
      date,
      doctorName,
      patientName,
      paymentUrl = BOOKING_REQUEST_EMAIL_CONFIG.PAYMENT_URL,
      time,
    } = ctx;

    return {
      from: from,
      to: to,
      subject: subject,
      react: BookingRequestEmail({
        consultationType,
        date,
        doctorName,
        patientName,
        paymentUrl,
        time,
      }),
    };
  }

  private handlePatientConfirmationTemplate(
    ctx: IHandlePatientConfirmationEmail,
  ) {
    const {
      from = PAYMENT_CONFIRMED_CONFIG.FROM,
      subject = PAYMENT_CONFIRMED_CONFIG.SUBJECT,
      patientName,
      doctorName,
      to,
      startTime,
      videoRoomUrl,
      consultationType,
      calendarUrl,
      date,
    } = ctx;

    return {
      from: from,
      to: to,
      subject: subject,
      react: PaymentConfirmationEmail({
        calendarUrl: calendarUrl!,
        consultationType: consultationType!,
        date: formatDateToReadable(date!),
        doctorName: doctorName!,
        patientName: patientName!,
        time: formatTimeReadable(Number(startTime!)),
        videoRoomUrl: videoRoomUrl!,
      }),
    };
  }

  private handlePaymentReminderTemplate(ctx: IHandleSendReminderEmail) {
    const {
      from = PAYMENT_CONFIRMED_CONFIG.FROM,
      subject = 'Reminder',
      consultationType,
      date,
      paymentUrl = PAYMENT_CONFIRMED_CONFIG.PAYMENT_URL,
      time,
      to,
      patientName,
      doctorName,
    } = ctx;

    return {
      from: from,
      to: to,
      subject: subject,
      react: PaymentReminderEmail({
        consultationType,
        date,
        doctorName,
        patientName,
        paymentUrl,
        time,
      }),
    };
  }

  async sendBookingEmail(ctx: IHandleBooking) {
    const { context } = ctx;
    const resend = this.initResend();
    let response: CreateEmailResponse | null = null;
    try {
      switch (context) {
        case 'BOOKING_CREATED':
          const bookingConfig = this.handleBookingRequestReceivedTemplate({
            consultationType: ctx.consultationType!,
            date: ctx.date!,
            doctorName: ctx.doctorName!,
            patientName: ctx.patientName!,
            time: ctx.time!,
            to: ctx.to!,
          });

          response = await resend.emails.send({
            from: bookingConfig.from,
            subject: bookingConfig.subject,
            to: bookingConfig.to,
            react: bookingConfig.react,
          });
          break;
        case 'PATIENT_CONFIRMATION':
          const paymentConfirmationConfig =
            this.handlePatientConfirmationTemplate({
              to: ctx.to!,
              bookingReference: ctx.bookingReference!,
              calendarUrl: ctx.calendarUrl,
              consultationType: ctx.consultationType,
              date: ctx.date,
              doctorName: ctx.doctorName,
              endTime: ctx.endTime,
              patientName: ctx.patientName,
              videoRoomUrl: ctx.videoRoomUrl,
              startTime: ctx.startTime,
            });

          const paymentConfirmationAttachments =
            this.icsService.generateIcsFile({
              description: paymentConfirmationConfig.subject,
              endTime: new Date(ctx.endTime!),
              startTime: new Date(ctx.startTime!),
              title: ctx.consultationType!,
              url: ctx.videoRoomUrl!,
            });

          response = await resend.emails.send({
            from: paymentConfirmationConfig.from,
            subject: paymentConfirmationConfig.subject,
            to: paymentConfirmationConfig.to,
            react: paymentConfirmationConfig.react,
            attachments: [
              {
                filename: 'consultation.ics',
                content: Buffer.from(paymentConfirmationAttachments as string),
              },
            ],
          });
          break;
        case 'DOCTOR_NOTIFICATION':
          break;
        case 'REMINDER':
          const paymentReminderConfig = this.handlePaymentReminderTemplate({
            to: ctx.to!,
            consultationType: ctx.consultationType!,
            date: ctx.date!,
            doctorName: ctx.doctorName!,
            patientName: ctx.patientName!,
            paymentUrl: ctx.paymentUrl!,
            time: ctx.time!,
          });

          response = await resend.emails.send({
            from: paymentReminderConfig.from,
            to: paymentReminderConfig.to,
            subject: paymentReminderConfig.subject,
            react: paymentReminderConfig.react,
          });
          break;
        case 'CANCELATION':
          break;
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
