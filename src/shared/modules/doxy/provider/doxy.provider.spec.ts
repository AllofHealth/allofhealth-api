import { Test, TestingModule } from '@nestjs/testing';
import { DoxyProvider } from './doxy.provider';

describe('DoxyProvider', () => {
  let provider: DoxyProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoxyProvider],
    }).compile();

    provider = module.get<DoxyProvider>(DoxyProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
