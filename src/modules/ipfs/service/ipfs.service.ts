import { Injectable } from '@nestjs/common';
import { IpfsProvider } from '../provider/ipfs.provider';

@Injectable()
export class IpfsService {
  constructor(private readonly ipfsProvider: IpfsProvider) {}

  async uploadRecord() {
    return await this.ipfsProvider.uploadRecord();
  }
}
