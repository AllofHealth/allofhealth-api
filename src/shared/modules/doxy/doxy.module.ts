import { Module } from '@nestjs/common';
import { DoxyProvider } from './provider/doxy.provider';
import { DoxyService } from './service/doxy.service';

@Module({
  providers: [DoxyProvider, DoxyService],
  exports: [DoxyService],
})
export class DoxyModule {}
