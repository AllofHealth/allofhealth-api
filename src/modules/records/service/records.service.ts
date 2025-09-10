import { Injectable } from '@nestjs/common';
import { RecordsProvider } from '../provider/records.provider';
import {
  ICreateRecord,
  IFetchPatientRecords,
  IFetchRecordById,
} from '../interface/records.interface';
<<<<<<< HEAD

@Injectable()
export class RecordsService {
=======
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@Injectable()
export class RecordsService {
  private readonly logger = new MyLoggerService(RecordsService.name);
>>>>>>> c4a97b599ee13bf577d48228045ff0488126f718
  constructor(private readonly recordsProvider: RecordsProvider) {}

  async createRecord(ctx: ICreateRecord) {
    return await this.recordsProvider.createRecord(ctx);
  }

  async fetchRecords(ctx: IFetchPatientRecords) {
<<<<<<< HEAD
=======
    this.logger.log(`Fetching records from service`);
>>>>>>> c4a97b599ee13bf577d48228045ff0488126f718
    return await this.recordsProvider.fetchRecords(ctx);
  }

  async fetchRecordByChainId(ctx: IFetchRecordById) {
<<<<<<< HEAD
=======
    this.logger.log(
      `Fetching records with chainId from service, ${JSON.stringify(ctx)}`,
    );
>>>>>>> c4a97b599ee13bf577d48228045ff0488126f718
    return await this.recordsProvider.fetchRecordByChainId(ctx);
  }
}
