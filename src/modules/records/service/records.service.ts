import { Injectable } from '@nestjs/common';
import { RecordsProvider } from '../provider/records.provider';
import {
  ICreateRecord,
  IFetchPatientRecords,
  IFetchRecordById,
} from '../interface/records.interface';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@Injectable()
export class RecordsService {
  private readonly logger = new MyLoggerService(RecordsService.name);
  constructor(private readonly recordsProvider: RecordsProvider) {}

  async createRecord(ctx: ICreateRecord) {
    return await this.recordsProvider.createRecord(ctx);
  }

  async fetchRecords(ctx: IFetchPatientRecords) {
    this.logger.log(`Fetching records from service`);
    return await this.recordsProvider.fetchRecords(ctx);
  }

  async fetchRecordByChainId(ctx: IFetchRecordById) {
    this.logger.log(
      `Fetching records with chainId from service, ${JSON.stringify(ctx)}`,
    );
    return await this.recordsProvider.fetchRecordByChainId(ctx);
  }
}
