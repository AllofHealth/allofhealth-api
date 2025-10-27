import { Test, TestingModule } from '@nestjs/testing';
import { FlutterwaveProvider } from './flutterwave.provider';

describe('FlutterwaveProvider', () => {
  let provider: FlutterwaveProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlutterwaveProvider],
    }).compile();

    provider = module.get<FlutterwaveProvider>(FlutterwaveProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
