import { Test, TestingModule } from '@nestjs/testing';
import { RecordsEncryptionService } from './record-encryption.service';
import { AuthUtils } from '@/shared/utils/auth.utils';

describe('ExternalAccountProvider', () => {
  let service: RecordsEncryptionService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordsEncryptionService, AuthUtils],
    }).compile();

    service = module.get<RecordsEncryptionService>(RecordsEncryptionService);
  });

  describe('Encryption', () => {
    it.only('It should encrypt a string', () => {});
  });
});
