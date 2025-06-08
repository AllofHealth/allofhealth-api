import { Test, TestingModule } from '@nestjs/testing';
import { ExternalAccountProvider } from './external-account.provider';

describe('ExternalAccountProvider', () => {
  let provider: ExternalAccountProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalAccountProvider],
    }).compile();

    provider = module.get<ExternalAccountProvider>(ExternalAccountProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Wallet creation', () => {
    it('should create an ethereum wallet', () => {
      const wallet = provider.createWallet();
      console.log(wallet);
      expect(wallet).toBeDefined();
      expect(wallet.data?.walletAddress).toBeDefined();
      expect(wallet.data?.privateKey).toBeDefined();
    });
  });
});
