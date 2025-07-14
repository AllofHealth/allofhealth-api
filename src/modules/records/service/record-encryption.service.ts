import { RecordConfig } from '@/shared/config/record/record.config';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RecordsEncryptionService {
  constructor(
    private readonly authUtils: AuthUtils,
    private readonly recordConfig: RecordConfig,
  ) {}

  encryptTest(test: string) {
    return this.authUtils.encryptKey({
      data: test,
      key: this.recordConfig.RECORD_ENCRYPTION_KEY,
    });
  }

  decryptTest(encryptedText: string) {
    return this.authUtils.decryptKey({
      data: encryptedText,
      key: this.recordConfig.RECORD_ENCRYPTION_KEY,
    });
  }
}
