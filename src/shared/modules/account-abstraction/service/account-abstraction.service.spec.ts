import { Test, TestingModule } from '@nestjs/testing';
import { AccountAbstractionService } from './account-abstraction.service';
import {
  LISK_MAINNET_BUNDLER_API_KEY,
  LISK_MAINNET_BUNDLER_ID,
  LISK_MAINNET_BUNDLER_URL,
  LISK_MAINNET_PAYMASTER_API_KEY,
  LISK_TESTNET_BUNDLER_API_KEY,
  LISK_TESTNET_BUNDLER_ID,
  LISK_TESTNET_BUNDLER_URL,
  LISK_TESTNET_PAYMASTER_API_KEY,
} from '@/shared/data/constants';
import { ExternalAccountService } from '../../external-account/service/external-account.service';
import { ExternalAccountProvider } from '../../external-account/provider/external-account.provider';
import { BiconomyConfig } from '@/shared/config/biconomy/biconomy.config';
import { AccountAbstractionProvider } from '../provider/account-abstraction.provider';
import { AuthUtils } from '@/shared/utils/auth.utils';

describe('AccountAbstractionService', () => {
  let service: AccountAbstractionService;
  const mockConfig = {
    LISK_TESTNET_BUNDLER_ID,
    LISK_TESTNET_BUNDLER_URL,
    LISK_TESTNET_BUNDLER_API_KEY,
    LISK_TESTNET_PAYMASTER_API_KEY,
    LISK_MAINNET_BUNDLER_ID,
    LISK_MAINNET_BUNDLER_API_KEY,
    LISK_MAINNET_BUNDLER_URL,
    LISK_MAINNET_PAYMASTER_API_KEY,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountAbstractionService,
        AccountAbstractionProvider,
        ExternalAccountService,
        ExternalAccountProvider,
        AuthUtils,
        {
          provide: BiconomyConfig,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<AccountAbstractionService>(AccountAbstractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Smart Account', () => {
    it('should create smart account and return wallet data', async () => {
      const result = await service.createSmartAccount({
        userId: '885bdbed-93ee-4db4-87d3-e6b051a5a706',
      });
      if (!('data' in result) || !result.data) {
        throw new Error('Error creating account');
      }

      console.log(result);
    }, 50000);
  });
});
