import { Test, TestingModule } from '@nestjs/testing';
import { CalComProvider } from './cal.com.provider';

describe('CalCom', () => {
  let provider: CalComProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalComProvider],
    }).compile();

    provider = module.get<CalComProvider>(CalComProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
