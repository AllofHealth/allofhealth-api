import { Test, TestingModule } from '@nestjs/testing';
import { ExternalAccountProvider } from './external-account.provider';
import { ExternalAccountSuccessMessage } from '../data/external-account.data';

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
      const result = provider.handleCreateWallet();

      expect(result.isOk()).toBe(true);

      const wallet = provider.handleResult(
        result,
        ExternalAccountSuccessMessage.WALLET_CREATED,
      );

      if (!('data' in wallet) || !(wallet.data && wallet)) {
        throw new Error('Wallet data not found');
      }

      expect(wallet.data).toBeDefined();
      expect(wallet.data.publicKey).toBeDefined();
      expect(wallet.data.privateKey).toBeDefined();
      expect(wallet.data.walletAddress).toBeDefined();
    });
  });
});
