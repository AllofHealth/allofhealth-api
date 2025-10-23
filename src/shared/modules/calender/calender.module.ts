import { Module } from '@nestjs/common';
import { CalcomService } from './service/calcom.service';
import { DoxyService } from './service/doxy.service';
import { CalendarIntegrationService } from './service/calendar-integration.service';

@Module({
  providers: [CalcomService, DoxyService, CalendarIntegrationService],
  exports: [CalcomService, DoxyService, CalendarIntegrationService],
})
export class CalendarModule {}
