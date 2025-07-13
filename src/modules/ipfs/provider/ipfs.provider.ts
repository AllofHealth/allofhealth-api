import { IpfsConfig } from '@/shared/config/ipfs/ipfs.config';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { IpfsClientService } from '../ipfs-client/ipfs-client.service';

@Injectable()
export class IpfsProvider implements OnModuleInit {
  private ipfsClient: any;

  constructor(
    private readonly ipfsConfig: IpfsConfig,
    private readonly handler: ErrorHandler,
    private readonly ipfsClientService: IpfsClientService,
  ) {}

  async onModuleInit() {
    try {
      const config: any = {
        host: this.ipfsConfig.IPFS_HOST,
        port: this.ipfsConfig.IPFS_PORT,
        protocol: this.ipfsConfig.IPFS_PROTOCOL,
      };

      // Only add auth headers if API key and secret are provided
      if (this.ipfsConfig.IPFS_API_KEY && this.ipfsConfig.IPFS_API_SECRET) {
        config.headers = {
          authorization: this.createAuth(),
        };
      }

      this.ipfsClient = await this.ipfsClientService.createClient(config);
    } catch (error) {
      this.handler.handleError(error, 'Failed to initialize IPFS client');
    }
  }

  private createAuth() {
    const auth =
      'Basic ' +
      Buffer.from(
        `${this.ipfsConfig.IPFS_API_KEY}:${this.ipfsConfig.IPFS_API_SECRET}`,
      ).toString('base64');

    return auth;
  }

  getIpfsClient() {
    if (!this.ipfsClient) {
      throw new Error('IPFS client not initialized');
    }
    return this.ipfsClient;
  }

  async uploadRecord() {
    try {
      const ipfs = this.getIpfsClient();
      const result = await ipfs.add(Buffer.from('Hello, IPFS!'));
      console.log(result.cid.toString());
      return result;
    } catch (error) {
      this.handler.handleError(error, 'Failed to upload record to IPFS');
      throw error;
    }
  }
}
