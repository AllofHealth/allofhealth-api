import { Module } from '@nestjs/common';
import { ResendService } from './service/resend.service';
import { ResendProvider } from './provider/resend.provider';

@Module({
  providers: [ResendProvider, ResendService],
  exports: [ResendService],
})
export class ResendModule {}
