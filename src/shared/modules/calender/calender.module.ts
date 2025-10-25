import { Module } from '@nestjs/common';
import { CalComModule } from '../cal.com/cal.com.module';
import { DoxyModule } from '../doxy/doxy.module';
import { CalendarService } from './service/calendar.service';

@Module({
  imports: [CalComModule, DoxyModule],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
