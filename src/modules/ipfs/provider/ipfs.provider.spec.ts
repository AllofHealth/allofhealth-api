import { Test, TestingModule } from '@nestjs/testing';
import { IpfsProvider } from './ipfs.provider';

describe('Ipfs', () => {
  let provider: IpfsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IpfsProvider],
    }).compile();

    provider = module.get<IpfsProvider>(IpfsProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
