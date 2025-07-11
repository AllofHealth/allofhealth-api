import { Controller, Get } from '@nestjs/common';
import { IpfsService } from '../service/ipfs.service';

@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Get('testIpfs')
  async testIpfs() {
    return await this.ipfsService.uploadRecord();
  }
}
