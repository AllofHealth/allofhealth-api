import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as OTPAuth from 'otpauth';
import {
  OTP_ERROR_MESSAGES as OEM,
  OTP_SUCCESS_MESSAGES as OSM,
} from '../data/otp.data';
import { EValidateOtp } from '@/shared/dtos/event.dto';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

interface OtpData {
  emailAddress: string;
  expires: number;
}

@Injectable()
export class OtpProvider {
  private readonly totp: OTPAuth.TOTP;
  private readonly logger = new MyLoggerService(OtpProvider.name);
  private readonly otpStore = new Map<string, OtpData>();

  private readonly OTP_TTL = 900; // 15 mins
  private readonly OTP_DIGITS = 6;

  constructor(
    private readonly handler: ErrorHandler,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.totp = this.createTotp();
  }

  createSecret() {
    return new OTPAuth.Secret();
  }

  private createTotp() {
    return new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      secret: this.createSecret(),
      algorithm: 'SHA1',
      digits: this.OTP_DIGITS,
      period: this.OTP_TTL,
    });
  }

  generateOtp(): string {
    return this.totp.generate();
  }

  async createOTP(emailAddress: string) {
    const code = this.generateOtp();
    try {
      const expires = Date.now() + this.OTP_TTL * 1000;
      this.logger.debug(`Storing OTP ${code} for ${emailAddress}`);
      this.otpStore.set(code, { emailAddress, expires });
      return code;
    } catch (err) {
      this.handler.handleError(err, OEM.ERROR_CREATING_OTP);
    }
  }

  async validateOtp(code: string) {
    const otpData = this.otpStore.get(code);

    if (!otpData) {
      throw new NotFoundException('OTP not found. Request a new OTP.');
    }

    const { emailAddress, expires } = otpData;

    if (Date.now() > expires) {
      this.otpStore.delete(code);
      throw new NotFoundException('OTP expired. Request a new OTP.');
    }

    this.logger.debug(`OTP ${code} matched for email ${emailAddress}`);

    this.eventEmitter.emit(
      SharedEvents.VALIDATE_OTP,
      new EValidateOtp(emailAddress),
    );

    this.otpStore.delete(code);

    return this.handler.handleReturn({
      status: HttpStatus.OK,
      message: 'Validation successful',
      data: true,
    });
  }

  generateOtpWithSecret(secret: OTPAuth.Secret | string): string {
    const totp = new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      algorithm: 'SHA1',
      secret,
      digits: this.OTP_DIGITS,
      period: 120,
    });

    return totp.generate();
  }

  validateOtpWithSecret(otp: string, secret: OTPAuth.Secret | string) {
    const totp = new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      algorithm: 'SHA1',
      secret,
      digits: this.OTP_DIGITS,
      period: 120,
    });

    return totp.validate({ token: otp, window: 1 });
  }
}
