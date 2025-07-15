import { Module } from '@nestjs/common';
import { OtpProvider } from './provider/otp.provider';
import { OtpService } from './service/otp.service';
import { OtpController } from './controller/otp.controller';

@Module({
  providers: [OtpService, OtpProvider],
  controllers: [OtpController],
})
export class OtpModule {}
