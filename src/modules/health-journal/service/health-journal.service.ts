import { Injectable } from '@nestjs/common';
import { HealthJournalProvider } from '../provider/health-journal.provider';
import { IAddEntry } from '../interface/health-journal.interface';

@Injectable()
export class HealthJournalService {
  constructor(private readonly journalProvider: HealthJournalProvider) {}

  async addEntryToJournal(ctx: IAddEntry) {
    return await this.journalProvider.addJournalEntry(ctx);
  }
}
