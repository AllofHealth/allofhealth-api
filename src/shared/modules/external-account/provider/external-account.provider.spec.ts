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
});
