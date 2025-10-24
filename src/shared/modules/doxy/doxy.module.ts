import { Module } from '@nestjs/common';
import { Doxy } from './doxy';
import { DoxyService } from './doxy.service';

@Module({
  providers: [Doxy, DoxyService]
})
export class DoxyModule {}
