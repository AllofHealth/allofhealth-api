import { Injectable } from '@nestjs/common';
import { IpfsProvider } from '../provider/ipfs.provider';

@Injectable()
export class IpfsService {
  constructor(private readonly ipfsProvider: IpfsProvider) {}

  async testIPFS() {
    return await this.ipfsProvider.testIPFS();
  }
}
