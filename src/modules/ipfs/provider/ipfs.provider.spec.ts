import { Test, TestingModule } from '@nestjs/testing';
import { IpfsProvider } from './ipfs.provider';
import {
  IPFS_API_KEY,
  IPFS_API_SECRET,
  IPFS_HOST,
  IPFS_PORT,
  IPFS_PROTOCOL,
} from '@/shared/data/constants';
import { IpfsConfig } from '@/shared/config/ipfs/ipfs.config';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { IpfsClientService } from '../ipfs-client/ipfs-client.service';

const mockIpfsClient = {
  add: jest.fn().mockResolvedValue({
    cid: { toString: () => 'QmTestCID123' },
  }),
};

const mockIpfsClientService = {
  createClient: jest.fn().mockResolvedValue(mockIpfsClient),
};

describe('Ipfs', () => {
  let provider: IpfsProvider;
  const mockConfig = {
    IPFS_HOST: IPFS_HOST,
    IPFS_PORT: IPFS_PORT,
    IPFS_PROTOCOL: IPFS_PROTOCOL,
    IPFS_API_KEY: IPFS_API_KEY,
    IPFS_API_SECRET: IPFS_API_SECRET,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IpfsProvider,
        ErrorHandler,
        {
          provide: IpfsConfig,
          useValue: mockConfig,
        },
        IpfsClientService,
      ],
    }).compile();

    provider = module.get<IpfsProvider>(IpfsProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('initialize ipfs', () => {
    it('should successfully init ipfs', async () => {
      await provider.onModuleInit();

      const result = await provider.testIPFS();
      expect(result).toBeDefined();
    }, 10000);
  });

  describe('Records', () => {
    it.only('should seccessfully fetch record from ipfs', async () => {
      await provider.onModuleInit();
      const record = await provider.fetchRecord(
        'QmXRo6Wr5aM2iQcBvESY6supqnKtctGwCyyY2hJJBGs9wd',
      );
      console.log(record);
    }, 50000);
  });

  describe('Findind Path', () => {
    it('Should return a valid path', async () => {
      await provider.onModuleInit();

      const path = await provider.findPathFromCid({
        userId: '37733ba6-a557-47c1-923b-90e9b0efddea',
        cid: 'Qmf2G1Layb63jxXREKn2Tvf5CwkAm2fKhZvJVptsd1BWyF',
      });
      console.log(path);
    }, 50000);
  });
});
