import { Module } from '@nestjs/common';
import { IpfsProvider } from './provider/ipfs.provider';
import { IpfsService } from './service/ipfs.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { IpfsController } from './controller/ipfs.controller';
import { IpfsClientService } from './ipfs-client/ipfs-client.service';

@Module({
  providers: [IpfsProvider, IpfsService, IpfsClientService, ErrorHandler],
  exports: [IpfsService],
  controllers: [IpfsController],
})
export class IpfsModule {}
