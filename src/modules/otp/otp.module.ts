import { Module } from '@nestjs/common';
import { OtpProvider } from './provider/otp.provider';
import { OtpService } from './service/otp.service';
import { OtpController } from './controller/otp.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [OtpService, OtpProvider, ErrorHandler],
  controllers: [OtpController],
})
export class OtpModule {}
