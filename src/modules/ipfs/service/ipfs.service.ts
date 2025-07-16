import { Injectable } from '@nestjs/common';
import { IpfsProvider } from '../provider/ipfs.provider';
import { IMedicalRecord } from '../interface/ipfs.interface';

@Injectable()
export class IpfsService {
  constructor(private readonly ipfsProvider: IpfsProvider) {}

  async testIPFS() {
    return await this.ipfsProvider.testIPFS();
  }

  async uploadRecordToIpfs(ctx: IMedicalRecord) {
    return await this.ipfsProvider.handleRecordUpload(ctx);
  }

  async fetchRecordFromIpfs(cid: string) {
    return await this.ipfsProvider.fetchRecord(cid);
  }
}
