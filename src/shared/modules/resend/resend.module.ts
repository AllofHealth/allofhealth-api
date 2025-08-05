import { Module } from '@nestjs/common';
import { ResendService } from './service/resend.service';
import { ResendProvider } from './provider/resend.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [ResendProvider, ResendService, ErrorHandler],
  exports: [ResendService],
})
export class ResendModule {}
