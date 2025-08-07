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
        {
          provide: IpfsClientService,
          useValue: mockIpfsClientService,
        },
      ],
    }).compile();

    provider = module.get<IpfsProvider>(IpfsProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('initialize ipfs', () => {
    it('should successfully init ipfs', async () => {
      // Initialize the IPFS client first
      await provider.onModuleInit();

      // Then test the upload functionality
      const result = await provider.testIPFS();
      expect(result).toBeDefined();
    }, 10000);
  });

  describe('Records', () => {
    it.only('should seccessfully fetch record from ipfs', async () => {
      await provider.onModuleInit();
      const record = await provider.fetchRecord(
        'QmXN3eYQtHxvCyQysD1ATCKiNcoYbivcA1pdD5BKU9Yonk',
      );
      console.log(record);
    });
  });
});
