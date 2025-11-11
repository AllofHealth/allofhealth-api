import { Module } from '@nestjs/common';
import { IcsService } from './service/ics.service';

@Module({
  providers: [IcsService],
  exports: [IcsService],
})
export class IcsModule {}
