import { AuthUtils } from '@/shared/utils/auth.utils';
import { Test, type TestingModule } from '@nestjs/testing';
import { ExternalAccountProvider } from './external-account.provider';

describe('ExternalAccountProvider', () => {
  let provider: ExternalAccountProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalAccountProvider, AuthUtils],
    }).compile();

    provider = module.get<ExternalAccountProvider>(ExternalAccountProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Wallet creation', () => {
    it('should create an ethereum wallet', () => {
      const result = provider.handleCreateWallet();
      console.log(result);
    });
  });
});
