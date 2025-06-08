import { Test, TestingModule } from '@nestjs/testing';
import { ExternalAccountService } from './external-account.service';

describe('ExternalAccountService', () => {
  let service: ExternalAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalAccountService],
    }).compile();

    service = module.get<ExternalAccountService>(ExternalAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
