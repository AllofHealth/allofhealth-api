import { Test, TestingModule } from '@nestjs/testing';
import { AccountAbstractionService } from './account-abstraction.service';

describe('AccountAbstractionService', () => {
  let service: AccountAbstractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountAbstractionService],
    }).compile();

    service = module.get<AccountAbstractionService>(AccountAbstractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
