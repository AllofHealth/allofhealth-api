import { Module } from '@nestjs/common';
import { HealthJournalService } from './health-journal.service';
import { HealthJournalController } from './health-journal.controller';
import { HealthJournal } from './health-journal';

@Module({
  providers: [HealthJournalService, HealthJournal],
  controllers: [HealthJournalController]
})
export class HealthJournalModule {}
