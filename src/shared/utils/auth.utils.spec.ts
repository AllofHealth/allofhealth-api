import { Test, TestingModule } from '@nestjs/testing';
import { AuthUtils } from './auth.utils';

describe('ExternalAccountProvider', () => {
  let utils: AuthUtils;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthUtils],
    }).compile();

    utils = module.get<AuthUtils>(AuthUtils);
  });

  describe('Key creation', () => {
    it.only('should generate a random encryption key', () => {
      const key = utils.generateEncryptionKey();
      const keyLength = key.length;

      console.debug(key);
      expect(keyLength).toBe(44);
    });
  });
});
