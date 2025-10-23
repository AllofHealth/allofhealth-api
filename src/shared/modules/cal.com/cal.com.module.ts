import { Module } from '@nestjs/common';
import { CalComProvider } from './provider/cal.com.provider';
import { CalComService } from './service/cal.com.service';
@Module({
  providers: [CalComProvider, CalComService],
  exports: [CalComService],
})
export class CalComModule {}
