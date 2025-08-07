import { Injectable } from '@nestjs/common';
import { RecordsProvider } from '../provider/records.provider';
import {
  ICreateRecord,
  IFetchPatientRecords,
  IFetchRecordById,
} from '../interface/records.interface';

@Injectable()
export class RecordsService {
  constructor(private readonly recordsProvider: RecordsProvider) {}

  async createRecord(ctx: ICreateRecord) {
    return await this.recordsProvider.createRecord(ctx);
  }

  async fetchRecords(ctx: IFetchPatientRecords) {
    return await this.recordsProvider.fetchRecords(ctx);
  }

  async fetchRecordByChainId(ctx: IFetchRecordById) {
    return await this.recordsProvider.fetchRecordByChainId(ctx);
  }
}
