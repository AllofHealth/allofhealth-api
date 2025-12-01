import { forwardRef, Module } from '@nestjs/common';
import { CalComModule } from '../cal.com/cal.com.module';
import { DoxyModule } from '../doxy/doxy.module';
import { CalendarService } from './service/calendar.service';
import { CalendarProvider } from './provider/calendar.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  imports: [forwardRef(() => CalComModule), forwardRef(() => DoxyModule)],
  providers: [CalendarService, CalendarProvider, ErrorHandler],
  exports: [CalendarService],
})
export class CalendarModule {}
