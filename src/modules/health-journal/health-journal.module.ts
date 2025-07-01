import { Module } from '@nestjs/common';
import { HealthJournal } from './health-journal';
import { HealthJournalController } from './health-journal.controller';
import { HealthJournalService } from './health-journal.service';

@Module({
  providers: [HealthJournalService, HealthJournal],
  controllers: [HealthJournalController],
})
export class HealthJournalModule {}
