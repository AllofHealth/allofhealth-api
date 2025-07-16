import { RecordConfig } from '@/shared/config/record/record.config';
import { RECORD_ENCRYPTION_KEY } from '@/shared/data/constants';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { Test, TestingModule } from '@nestjs/testing';
import { RecordsEncryptionService } from './record-encryption.service';

describe('MedicalRecordEncryptionService', () => {
  let service: RecordsEncryptionService;
  const MockRecordConfig = {
    RECORD_ENCRYPTION_KEY,
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsEncryptionService,
        AuthUtils,
        ErrorHandler,
        {
          provide: RecordConfig,
          useValue: MockRecordConfig,
        },
      ],
    }).compile();

    service = module.get<RecordsEncryptionService>(RecordsEncryptionService);
  });

  describe('Encryption', () => {
    it.only('should encrypt a medical record ', async () => {
      const clinicalNotes = [
        'This patient is not healthy',
        'Patient should visit the pharamcist',
      ];
      const diagnosis = ['Patient is suffering from malaria'];

      const result = await service.encryptMedicalRecord({
        clinicalNotes,
        diagnosis,
      });

      console.debug(result);
    });
  });
});
