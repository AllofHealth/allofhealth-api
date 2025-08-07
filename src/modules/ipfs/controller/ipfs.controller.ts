import { Controller, Get, Query } from '@nestjs/common';
import { IpfsService } from '../service/ipfs.service';

@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Get('testIpfs')
  async testIpfs() {
    return await this.ipfsService.testIPFS();
  }

  @Get('fetchRecord')
  async fetchRecord(@Query('cid') cid: string) {
    return await this.ipfsService.fetchRecordFromIpfs(cid);
  }
}
