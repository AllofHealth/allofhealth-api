import { Module } from '@nestjs/common';
import { HealthJournalProvider } from './provider/health-journal.provider';
import { HealthJournalService } from './service/health-journal.service';
import { HealthJournalController } from './controller/health-journal.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [HealthJournalService, HealthJournalProvider, ErrorHandler],
  controllers: [HealthJournalController],
})
export class HealthJournalModule {}
