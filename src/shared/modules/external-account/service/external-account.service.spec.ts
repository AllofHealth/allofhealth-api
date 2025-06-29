import { Test, TestingModule } from '@nestjs/testing';
import { ExternalAccountService } from './external-account.service';
import { ExternalAccountProvider } from '../provider/external-account.provider';

describe('ExternalAccountService', () => {
  let service: ExternalAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalAccountService, ExternalAccountProvider],
    }).compile();

    service = module.get<ExternalAccountService>(ExternalAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create external Wallet', () => {
    it('should create a wallet', () => {
      const result = service.createExternalWallet();

      console.log(result);
    });

    it('should create signer', () => {
      const result = service.createNewSigner();
      console.log(result);
    });
  });
});
