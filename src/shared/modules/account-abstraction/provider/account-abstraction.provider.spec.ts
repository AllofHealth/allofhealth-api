import { Test, type TestingModule } from '@nestjs/testing';
import { AccountAbstractionProvider } from './account-abstraction.provider';

describe('AccountAbstractionProvider', () => {
  let provider: AccountAbstractionProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountAbstractionProvider],
    }).compile();

    provider = module.get<AccountAbstractionProvider>(
      AccountAbstractionProvider
    );
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
