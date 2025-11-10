import { Module } from '@nestjs/common';
import { CalComProvider } from './provider/cal.com.provider';
import { CalComService } from './service/cal.com.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CalComProvider, CalComService],
  exports: [CalComService],
})
export class CalComModule {}
