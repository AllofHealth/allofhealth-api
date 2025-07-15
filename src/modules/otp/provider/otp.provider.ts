import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';

@Injectable()
export class OtpProvider {
  constructor(private readonly handler: ErrorHandler) {}

  initTotp() {
    return new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      algorithm: 'SHA1',
      digits: 6,
      period: 120,
    });
  }

  generateOtp() {
    const totp = this.initTotp();
    return totp.generate();
  }
}
