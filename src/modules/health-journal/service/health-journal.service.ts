import { Injectable } from '@nestjs/common';
import { HealthJournalProvider } from '../provider/health-journal.provider';
import {
  IAddEntry,
  IFetchJournal,
  IFetchJournalMetrics,
  IFetchMonthlyJournal,
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

  async fetchMonthlyJournal(ctx: IFetchMonthlyJournal) {
    return await this.journalProvider.fetchMonthlyJournal(ctx);
  }

  async fetchJournalMetrics(ctx: IFetchJournalMetrics) {
    return await this.journalProvider.fetchJournalMetrics(ctx);
  }
}
