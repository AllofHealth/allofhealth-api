import { Test, type TestingModule } from '@nestjs/testing';
import { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import {
  CONTRACT_ADDRESS,
  ENCRYPTION_KEY,
  SUPER_PRIVATE_KEY,
} from '@/shared/data/constants';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { ExternalAccountProvider } from '@/shared/modules/external-account/provider/external-account.provider';
import { ExternalAccountService } from '@/shared/modules/external-account/service/external-account.service';
import { ContractProvider } from './contract.provider';
import { AccountAbstractionService } from '@/shared/modules/account-abstraction/service/account-abstraction.service';
import { RewardService } from '@/modules/reward/service/reward.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('Contract', () => {
  let provider: ContractProvider;
  const mockConfig = {
    ENCRYPTION_KEY,
    CONTRACT_ADDRESS,
    SUPER_PRIVATE_KEY,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractProvider,
        ExternalAccountService,
        ExternalAccountProvider,
        AccountAbstractionService,
        RewardService,
        EventEmitter2,
        ErrorHandler,
        {
          provide: ContractConfig,
          useValue: mockConfig,
        },
      ],
    }).compile();

    provider = module.get<ContractProvider>(ContractProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Contract Setup', () => {
    it('should successfully interact with contract and return admin count', async () => {
      const result = await provider.handleGetSystemAdminCount();
      console.debug(result);
    }, 5000);
  });

  describe('Validate Approval', () => {
    it('Should check if a doctor is approved to add new record', async () => {
      const result = await provider.isApprovedToAddNewRecord({
        patientId: 12,
        doctorAddress: '0x120bc2dCdeE148eA839224Ee90F7Aaff6d42748C',
      });

      console.debug(result);
      expect(result).toBeDefined();
    });
  });
});
