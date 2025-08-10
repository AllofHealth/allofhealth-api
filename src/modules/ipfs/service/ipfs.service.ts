import { Injectable } from '@nestjs/common';
import { IpfsProvider } from '../provider/ipfs.provider';
import { IMedicalRecord } from '../interface/ipfs.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/shared.events';
import { EDeleteIpfsRecord } from '@/shared/dtos/event.dto';

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

  @OnEvent(SharedEvents.DELETE_IPFS_RECORD)
  async deleteRecordFromIpfs(ctx: EDeleteIpfsRecord) {
    return await this.ipfsProvider.deleteRecord(ctx);
  }
}
