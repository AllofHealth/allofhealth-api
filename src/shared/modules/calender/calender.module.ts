import { Module } from '@nestjs/common';
import { DoxyService } from './service/doxy.service';
import { CalendarIntegrationService } from './service/calendar-integration.service';
import { CalComModule } from '../cal.com/cal.com.module';

@Module({
  imports: [CalComModule],
  providers: [DoxyService, CalendarIntegrationService],
  exports: [DoxyService, CalendarIntegrationService],
})
export class CalendarModule {}
