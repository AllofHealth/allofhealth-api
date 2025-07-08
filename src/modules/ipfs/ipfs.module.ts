import { Module } from '@nestjs/common';
import { IpfsProvider } from './provider/ipfs.provider';
import { IpfsService } from './service/ipfs.service';

@Module({
  providers: [IpfsProvider, IpfsService],
  exports: [IpfsService],
})
export class IpfsModule {}
