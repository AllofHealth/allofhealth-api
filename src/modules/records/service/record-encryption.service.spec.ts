import { Test, TestingModule } from '@nestjs/testing';
import { RecordsEncryptionService } from './record-encryption.service';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { RECORD_ENCRYPTION_KEY } from '@/shared/data/constants';
import { RecordConfig } from '@/shared/config/record/record.config';

describe('ExternalAccountProvider', () => {
  let service: RecordsEncryptionService;
  const MockRecordConfig = {
    RECORD_ENCRYPTION_KEY,
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsEncryptionService,
        AuthUtils,
        {
          provide: RecordConfig,
          useValue: MockRecordConfig,
        },
      ],
    }).compile();

    service = module.get<RecordsEncryptionService>(RecordsEncryptionService);
  });

  describe('Encryption', () => {
    it('It should encrypt a string', () => {
      const testString =
        "This is a basic test generated to simulate a clinical note. generally the doctor should type and submit some shit here. i just want to test if there's a limit on the amount of text that can be encrypted";

      const encryptedText = service.encryptTest(testString);
      console.debug(encryptedText);
    });

    it.only('It should decrypt an encrypted string', () => {
      const encryptedText =
        '66580142549ad21c2727ed7898c28535:11d18dc9c1a90a6380e8644a9425c4d9094be3903ad221982733b4f10fb3ae9d9d68ac2df1339fdb4972afe8d806491a2fd44f429ba34a60802668b3aa501411564e8774dafe47c3692151502a130a5a653547a8f3b51efe4a3e1cbaaa73cb2d1c124522fb678d2acad4f32aa192994483776489e0bbd989816957068cb065f9925c654d2ca02f6c8f617b666f84a2f36429fec931effb8406b65d72db1d7b6bbf631c5ffed1b3e228c9bc45e06de5fc2d3a912684cc5700b792cd22c34cd3a771da7a86ced805cc81a0918b624bf683';
      const decryptedText = service.decryptTest(encryptedText);
      console.debug(decryptedText);
    });
  });
});
