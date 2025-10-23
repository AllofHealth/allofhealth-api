// src/shared/calendar/calendar.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalcomService } from './service/calcom.service';
import { DoxyService } from './service/doxy.service';
import { CalendarIntegrationService } from './service/calendar-integration.service';
import { calcomConfig } from './config/calcom.config';
import { doxyConfig } from './config/doxy.config';

@Module({
    imports: [
        ConfigModule.forFeature(calcomConfig),
        ConfigModule.forFeature(doxyConfig),
    ],
    providers: [
        CalcomService,
        DoxyService,
        CalendarIntegrationService,
    ],
    exports: [
        CalcomService,
        DoxyService,
        CalendarIntegrationService,
    ],
})
export class CalendarModule { }