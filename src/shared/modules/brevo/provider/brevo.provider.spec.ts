import { Test, TestingModule } from '@nestjs/testing';
import { BrevoProvider } from './brevo.provider';

describe('BrevoProvider', () => {
  let provider: BrevoProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrevoProvider],
    }).compile();

    provider = module.get<BrevoProvider>(BrevoProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
