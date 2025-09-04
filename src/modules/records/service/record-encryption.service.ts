import { RecordConfig } from '@/shared/config/record/record.config';
import { AuthUtils } from '@/shared/utils/auth.utils';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IDecryptRecord, IEncryptRecord } from '../interface/records.interface';
import {
  RECORDS_ERROR_MESSAGES as REM,
  RECORDS_SUCCESS_MESSAGES as RSM,
} from '../data/records.data';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Injectable()
export class RecordsEncryptionService {
  constructor(
    private readonly authUtils: AuthUtils,
    private readonly recordConfig: RecordConfig,
    private readonly handler: ErrorHandler,
  ) {}

  private encryptRecord(test: string) {
    return this.authUtils.encryptKey({
      data: test,
      key: this.recordConfig.RECORD_ENCRYPTION_KEY,
    });
  }

  private decryptRecord(encryptedText: string) {
    return this.authUtils.decryptKey({
      data: encryptedText,
      key: this.recordConfig.RECORD_ENCRYPTION_KEY,
    });
  }

  private batchEncryptRecords(tests: string[]) {
    return Promise.all(tests.map((test) => this.encryptRecord(test)));
  }

  private batchDecryptRecords(encryptedTests: string[]) {
    return Promise.all(
      encryptedTests.map((encryptedTest) => this.decryptRecord(encryptedTest)),
    );
  }

  async encryptMedicalRecord(ctx: IEncryptRecord) {
    const {
      clinicalNotes,
      diagnosis,
      labResults,
      medicationsPrescribed,
      title,
    } = ctx;

    try {
      const encryptedTitle = this.encryptRecord(title);
      const encryptedClinicalNotes =
        await this.batchEncryptRecords(clinicalNotes);
      const encryptedDiagnosis = await this.batchEncryptRecords(diagnosis);

      let encryptedLabResults: string[] = [];
      let encryptedMedicationsPrescribed: string[] = [];

      if (labResults) {
        encryptedLabResults = await this.batchEncryptRecords(labResults);
      }

      if (medicationsPrescribed) {
        encryptedMedicationsPrescribed = await this.batchEncryptRecords(
          medicationsPrescribed,
        );
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.RECORD_ENCRYPTED_SUCCESSFULLY,
        data: {
          title: encryptedTitle,
          clinicalNotes: encryptedClinicalNotes,
          diagnosis: encryptedDiagnosis,
          labResults: encryptedLabResults,
          medicationsPrescribed: encryptedMedicationsPrescribed,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        `${REM.ERROR_ENCRYPTING_RECORD}, ${e}`,
      );
    }
  }

  async decryptMedicalRecord(ctx: IDecryptRecord) {
    const {
      clinicalNotes,
      diagnosis,
      labResults,
      medicationsPrescribed,
      title,
    } = ctx;

    try {
      const decryptedClinicalNotes =
        await this.batchDecryptRecords(clinicalNotes);
      const decryptedDiagnosis = await this.batchDecryptRecords(diagnosis);
      const decryptedTitle = this.decryptRecord(title);

      let decryptedLabResults: string[] = [];
      let decryptedMedicationsPrescribed: string[] = [];

      if (labResults) {
        decryptedLabResults = await this.batchDecryptRecords(labResults);
      }

      if (medicationsPrescribed) {
        decryptedMedicationsPrescribed = await this.batchDecryptRecords(
          medicationsPrescribed,
        );
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.RECORD_DECRYPTED_SUCCESSFULLY,
        data: {
          title: decryptedTitle,
          clinicalNotes: decryptedClinicalNotes,
          diagnosis: decryptedDiagnosis,
          labResults: decryptedLabResults,
          medicationsPrescribed: decryptedMedicationsPrescribed,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        `${REM.ERROR_DECRYPTING_RECORD}, ${e}`,
      );
    }
  }
}
