import { Injectable } from '@nestjs/common';
import { HealthJournalProvider } from '../provider/health-journal.provider';
import {
  IAddEntry,
  IFetchJournal,
} from '../interface/health-journal.interface';

@Injectable()
export class HealthJournalService {
  constructor(private readonly journalProvider: HealthJournalProvider) {}

  async addEntryToJournal(ctx: IAddEntry) {
    return await this.journalProvider.addJournalEntry(ctx);
  }

  async fetchUserJournals(ctx: IFetchJournal) {
    return await this.journalProvider.fetchUserJournal(ctx);
  }
}
