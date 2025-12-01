import { Module } from '@nestjs/common';
import { ResendService } from './service/resend.service';
import { ResendProvider } from './provider/resend.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { IcsModule } from '../ics/ics.module';

@Module({
  imports: [IcsModule],
  providers: [ResendProvider, ResendService, ErrorHandler],
  exports: [ResendService],
})
export class ResendModule {}
