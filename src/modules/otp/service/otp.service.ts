import { Injectable } from '@nestjs/common';
import { OtpProvider } from '../provider/otp.provider';

@Injectable()
export class OtpService {
  constructor(private readonly otpProvider: OtpProvider) {}

  generateOtp() {
    return this.otpProvider.generateOtp();
  }
}
