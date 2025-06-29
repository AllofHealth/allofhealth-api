import { Test, TestingModule } from '@nestjs/testing';
import { ContractProvider } from './contract.provider';

describe('Contract', () => {
  let provider: ContractProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractProvider],
    }).compile();

    provider = module.get<ContractProvider>(ContractProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
