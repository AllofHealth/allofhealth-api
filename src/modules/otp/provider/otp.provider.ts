import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';

@Injectable()
export class OtpProvider {
  private totp: OTPAuth.TOTP;

  constructor(private readonly handler: ErrorHandler) {
    this.totp = this.initTotp();
  }

  generateSecret() {
    return new OTPAuth.Secret();
  }

  initTotp() {
    return new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      algorithm: 'SHA1',
      secret: this.generateSecret(),
      digits: 6,
      period: 120,
    });
  }

  generateOtp() {
    return this.totp.generate();
  }

  validateOtp(otp: string) {
    let isValid: boolean = false;
    const validation = this.totp.validate({ token: otp, window: 1 });
    if (validation !== null && typeof validation == 'number') {
      isValid = true;
    }
    return isValid;
  }

  generateOtpWithSecret(secret: OTPAuth.Secret | string) {
    const totp = new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      algorithm: 'SHA1',
      secret: secret,
      digits: 6,
      period: 120,
    });
    return totp.generate();
  }

  validateOtpWithSecret(otp: string, secret: OTPAuth.Secret | string) {
    const totp = new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      algorithm: 'SHA1',
      secret: secret,
      digits: 6,
      period: 120,
    });
    return totp.validate({ token: otp, window: 1 });
  }
}
