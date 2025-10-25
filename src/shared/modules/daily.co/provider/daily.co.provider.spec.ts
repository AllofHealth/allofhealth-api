import { Test, TestingModule } from '@nestjs/testing';
import { DailyCoProvider } from './daily.co.provider';

describe('DailyCo', () => {
  let provider: DailyCoProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyCoProvider],
    }).compile();

    provider = module.get<DailyCoProvider>(DailyCoProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
