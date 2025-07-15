import { Injectable } from '@nestjs/common';
import { OtpProvider } from '../provider/otp.provider';
import * as OTPAuth from 'otpauth';

@Injectable()
export class OtpService {
  constructor(private readonly otpProvider: OtpProvider) {}

  generateOtp() {
    return this.otpProvider.generateOtp();
  }

  validateOtp(token: string) {
    return this.otpProvider.validateOtp(token);
  }

  generateOtpWithSecret(secret: OTPAuth.Secret | string) {
    return this.otpProvider.generateOtpWithSecret(secret);
  }

  validateOtpWithSecret(token: string, secret: OTPAuth.Secret | string) {
    return this.otpProvider.validateOtpWithSecret(token, secret);
  }

  generateSecret() {
    return this.otpProvider.generateSecret();
  }
}
